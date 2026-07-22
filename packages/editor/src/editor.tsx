"use client";

import { useState, useCallback, useEffect } from "react";
import { EditorContent } from "@tiptap/react";
import { cn } from "./lib/utils";
import { useOttoEditor } from "./hooks/use-editor";
import { EditorToolbar } from "./editor-toolbar";
import { BubbleToolbar } from "./components/bubble-toolbar";
import { YjsProvider, useYjsProvider } from "./providers/yjs-provider";
import { SlashMenu } from "./components/slash-menu";
import { AIToolbar } from "./components/ai-toolbar";
import type { OttoEditorProps } from "./types";
import "katex/dist/katex.min.css";
import "./styles/editor.css";

/**
 * Inner editor component that uses the YjsProvider context.
 */
function OttoEditorInner({
  content,
  onChange,
  placeholder,
  editable = true,
  showToolbar = true,
  showWordCount = false,
  minHeight = "200px",
  collaborative = false,
  documentId,
  user,
  aiEnabled = false,
  format = "auto",
  variant = "default",
  className,
}: OttoEditorProps) {
  const editor = useOttoEditor({
    content,
    onChange,
    editable,
    placeholder,
    collaborative,
    documentId,
    user,
    format,
  });

  const { connected } = useYjsProvider();

  // Slash menu state
  const [slashMenuOpen, setSlashMenuOpen] = useState(false);
  const [slashMenuPos, setSlashMenuPos] = useState({ top: 0, left: 0 });

  // AI toolbar state (selection-based)
  const [aiToolbarOpen, setAiToolbarOpen] = useState(false);
  const [aiToolbarPos, setAiToolbarPos] = useState({ top: 0, left: 0 });
  const [aiProcessing, setAiProcessing] = useState(false);

  // Bubble toolbar state (for tiptap variant)
  const [bubbleOpen, setBubbleOpen] = useState(false);
  const [bubblePos, setBubblePos] = useState({ top: 0, left: 0 });

  const isTiptap = variant === "tiptap";
  const isGdocs = variant === "gdocs";

  // Track selection for bubble toolbar (tiptap variant) and AI toolbar
  useEffect(() => {
    if (!editor || !editable) return;

    const handleSelectionUpdate = () => {
      const { from, to, empty } = editor.state.selection;

      if (empty) {
        setBubbleOpen(false);
        setAiToolbarOpen(false);
        return;
      }

      const text = editor.state.doc.textBetween(from, to, " ");
      const coords = editor.view.coordsAtPos(from);

      if (isTiptap) {
        // Bubble toolbar below selection in tiptap mode
        const bottomCoords = editor.view.coordsAtPos(to);
        setBubblePos({
          top: bottomCoords.bottom + 8,
          left: (coords.left + bottomCoords.right) / 2,
        });
        setBubbleOpen(true);
      }

      // AI toolbar above selection when enough text is selected
      if (aiEnabled && text.length > 5) {
        setAiToolbarPos({
          top: coords.top - 48,
          left: coords.left,
        });
        setAiToolbarOpen(true);
      } else {
        setAiToolbarOpen(false);
      }
    };

    editor.on("selectionUpdate", handleSelectionUpdate);
    return () => {
      editor.off("selectionUpdate", handleSelectionUpdate);
    };
  }, [editor, editable, isTiptap, aiEnabled]);

  // Slash command detection
  useEffect(() => {
    if (!editor || !aiEnabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "/" && editor.isActive("paragraph")) {
        const { $from } = editor.state.selection;
        const textBefore = $from.parent.textContent.slice(0, $from.parentOffset);
        if (textBefore === "" || textBefore.endsWith(" ")) {
          const coords = editor.view.coordsAtPos($from.pos);
          setSlashMenuPos({
            top: coords.bottom + 4,
            left: coords.left,
          });
          setSlashMenuOpen(true);
        }
      }
    };

    const editorEl = editor.view.dom;
    editorEl.addEventListener("keydown", handleKeyDown);
    return () => editorEl.removeEventListener("keydown", handleKeyDown);
  }, [editor, aiEnabled]);

  // Handle slash command selection
  const handleSlashCommand = useCallback(
    async (command: string) => {
      setSlashMenuOpen(false);
      if (!editor) return;

      const { $from } = editor.state.selection;
      const textBefore = $from.parent.textContent.slice(0, $from.parentOffset);
      if (textBefore.endsWith("/")) {
        editor.chain().focus().deleteRange({
          from: $from.pos - 1,
          to: $from.pos,
        }).run();
      }

      if (command === "write") {
        const prompt = window.prompt("What would you like me to write?");
        if (!prompt) return;

        setAiProcessing(true);
        try {
          const response = await fetch("/api/ai/generate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              prompt,
              context: "lesson",
              beforeCursor: editor.state.doc.textBetween(0, editor.state.selection.from, "\n").slice(-500),
            }),
          });

          if (!response.ok) throw new Error("Generation failed");

          const reader = response.body?.getReader();
          const decoder = new TextDecoder();

          if (reader) {
            while (true) {
              const { done, value } = await reader.read();
              if (done) break;
              const chunk = decoder.decode(value, { stream: true });
              const lines = chunk.split("\n").filter(Boolean);
              for (const line of lines) {
                if (line.startsWith("0:")) {
                  try {
                    const text = JSON.parse(line.slice(2));
                    editor.chain().focus().insertContent(text).run();
                  } catch { /* skip */ }
                }
              }
            }
          }
        } catch (error) {
          console.error("[editor] AI generation error:", error);
        } finally {
          setAiProcessing(false);
        }
      } else if (command === "continue") {
        setAiProcessing(true);
        try {
          const { from } = editor.state.selection;
          const beforeCursor = editor.state.doc.textBetween(0, from, "\n").slice(-500);

          const response = await fetch("/api/ai/autocomplete", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ prefix: beforeCursor.slice(-100) }),
          });

          if (!response.ok) throw new Error("Continue failed");

          const reader = response.body?.getReader();
          const decoder = new TextDecoder();

          if (reader) {
            while (true) {
              const { done, value } = await reader.read();
              if (done) break;
              const chunk = decoder.decode(value, { stream: true });
              const lines = chunk.split("\n").filter(Boolean);
              for (const line of lines) {
                if (line.startsWith("0:")) {
                  try {
                    const text = JSON.parse(line.slice(2));
                    editor.chain().focus().insertContent(text).run();
                  } catch { /* skip */ }
                }
              }
            }
          }
        } catch (error) {
          console.error("[editor] AI continue error:", error);
        } finally {
          setAiProcessing(false);
        }
      } else {
        const { from, to } = editor.state.selection;
        const selectedText = editor.state.doc.textBetween(from, to, " ");
        if (!selectedText) {
          editor.chain().focus().selectParentNode().run();
          return;
        }
        await handleAIAction(command, selectedText, from, to);
      }
    },
    [editor]
  );

  const handleAIAction = useCallback(
    async (action: string, selectedText: string, from: number, to: number) => {
      if (!editor) return;
      setAiProcessing(true);
      setAiToolbarOpen(false);

      try {
        const response = await fetch("/api/ai/edit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ selectedText, action, context: "lesson" }),
        });

        if (!response.ok) throw new Error("Edit failed");

        const reader = response.body?.getReader();
        const decoder = new TextDecoder();
        let replacement = "";

        if (reader) {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            const chunk = decoder.decode(value, { stream: true });
            const lines = chunk.split("\n").filter(Boolean);
            for (const line of lines) {
              if (line.startsWith("0:")) {
                try { replacement += JSON.parse(line.slice(2)); } catch { /* skip */ }
              }
            }
          }
        }

        if (replacement) {
          editor.chain().focus().deleteRange({ from, to }).insertContent(replacement).run();
        }
      } catch (error) {
        console.error("[editor] AI edit error:", error);
      } finally {
        setAiProcessing(false);
      }
    },
    [editor]
  );

  if (!editor) return null;

  const wordCount = editor.storage.characterCount?.words?.() ?? 0;
  const charCount = editor.storage.characterCount?.characters?.() ?? 0;

  // ── TIPTAP VARIANT ─────────────────────────────────────────────
  if (isTiptap) {
    return (
      <div className={cn("otto-editor-tiptap relative", className)}>
        {/* Collaboration indicator */}
        {collaborative && (
          <div className="absolute top-2 right-2 flex items-center gap-1.5 text-xs text-muted-foreground z-10">
            <span className={cn("h-1.5 w-1.5 rounded-full", connected ? "bg-brand-success" : "bg-muted-foreground")} />
            {connected ? "Live" : "Offline"}
          </div>
        )}

        {/* AI processing pill */}
        {aiProcessing && (
          <div className="absolute top-2 left-2 flex items-center gap-1.5 rounded-full bg-surface-300 px-3 py-1 text-xs text-muted-foreground z-10">
            <span className="h-1.5 w-1.5 rounded-full bg-brand-accent animate-pulse" />
            AI is writing…
          </div>
        )}

        {/* Editor Content — clean document style */}
        <EditorContent
          editor={editor}
          className="otto-editor-content"
          style={{ minHeight }}
        />

        {/* Bubble Toolbar — appears on text selection */}
        {bubbleOpen && editable && (
          <div
            className="otto-bubble-toolbar"
            style={{ top: bubblePos.top, left: bubblePos.left, transform: "translateX(-50%)" }}
          >
            <BubbleToolbar editor={editor} />
          </div>
        )}

        {/* AI Toolbar — above selection when AI is enabled */}
        {aiEnabled && aiToolbarOpen && editable && (
          <AIToolbar
            editor={editor}
            position={aiToolbarPos}
            onAction={(action) => {
              const { from, to } = editor.state.selection;
              const selectedText = editor.state.doc.textBetween(from, to, " ");
              handleAIAction(action, selectedText, from, to);
            }}
            isProcessing={aiProcessing}
          />
        )}

        {/* Slash Menu */}
        {aiEnabled && (
          <SlashMenu
            isOpen={slashMenuOpen}
            onClose={() => setSlashMenuOpen(false)}
            onSelect={handleSlashCommand}
            position={slashMenuPos}
          />
        )}

        {/* Minimal word count */}
        {showWordCount && (
          <div className="mt-4 text-xs text-muted-foreground">
            {wordCount} words · {charCount} characters
          </div>
        )}
      </div>
    );
  }

  // ── GDOCS VARIANT ─────────────────────────────────────────────
  // Google Docs-style: fixed toolbar at top, clean canvas below
  if (isGdocs) {
    return (
      <div className={cn("otto-editor-tiptap", className)}>
        {/* Fixed formatting toolbar — always visible */}
        {showToolbar && editable && (
          <div className="sticky top-0 z-20 border-b border-border/5 bg-background/95 backdrop-blur-sm">
            <EditorToolbar
              editor={editor}
              className="border-0 bg-transparent rounded-none"
            />
          </div>
        )}

        {/* Collaboration indicator */}
        {collaborative && (
          <div className="flex items-center gap-1.5 px-2 py-1 text-xs text-muted-foreground border-b border-border/5">
            <span className={cn("h-1.5 w-1.5 rounded-full", connected ? "bg-brand-success" : "bg-muted-foreground")} />
            {connected ? "Live editing" : "Offline"}
          </div>
        )}

        {/* AI processing bar */}
        {aiProcessing && (
          <div className="flex items-center gap-1.5 px-2 py-1 text-xs text-muted-foreground bg-surface-100 border-b border-border/5">
            <span className="h-1.5 w-1.5 rounded-full bg-brand-accent animate-pulse" />
            AI is writing…
          </div>
        )}

        {/* Editor Content */}
        <EditorContent
          editor={editor}
          className="otto-editor-content"
          style={{ minHeight }}
        />

        {/* AI Toolbar — above selection */}
        {aiEnabled && aiToolbarOpen && editable && (
          <AIToolbar
            editor={editor}
            position={aiToolbarPos}
            onAction={(action) => {
              const { from, to } = editor.state.selection;
              const selectedText = editor.state.doc.textBetween(from, to, " ");
              handleAIAction(action, selectedText, from, to);
            }}
            isProcessing={aiProcessing}
          />
        )}

        {/* Slash Menu */}
        {aiEnabled && (
          <SlashMenu
            isOpen={slashMenuOpen}
            onClose={() => setSlashMenuOpen(false)}
            onSelect={handleSlashCommand}
            position={slashMenuPos}
          />
        )}

        {/* Word count */}
        {showWordCount && (
          <div className="mt-2 text-xs text-muted-foreground">
            {wordCount} words · {charCount} characters
          </div>
        )}
      </div>
    );
  }

  // ── DEFAULT VARIANT ─────────────────────────────────────────────
  return (
    <div
      className={cn(
        "rounded-md border border-border/10 bg-surface-100 overflow-hidden",
        className
      )}
    >
      {collaborative && (
        <div className="flex items-center gap-2 px-3 py-1 text-xs border-b border-border/10 bg-surface-200">
          <span className={cn("h-2 w-2 rounded-full", connected ? "bg-brand-success" : "bg-muted-foreground")} />
          <span className="text-muted-foreground">{connected ? "Connected" : "Connecting…"}</span>
        </div>
      )}

      {showToolbar && editable && <EditorToolbar editor={editor} />}

      <EditorContent editor={editor} className="otto-editor-content" style={{ minHeight }} />

      {showWordCount && (
        <div className="flex items-center justify-between px-3 py-1.5 text-xs text-muted-foreground border-t border-border/10">
          <span>{wordCount} words</span>
          <span>{charCount} characters</span>
        </div>
      )}

      {aiProcessing && (
        <div className="flex items-center gap-2 px-3 py-1.5 text-xs text-muted-foreground border-t border-border/10 bg-surface-200">
          <span className="h-2 w-2 rounded-full bg-brand-accent animate-pulse" />
          <span>AI is writing…</span>
        </div>
      )}

      {aiEnabled && (
        <SlashMenu
          isOpen={slashMenuOpen}
          onClose={() => setSlashMenuOpen(false)}
          onSelect={handleSlashCommand}
          position={slashMenuPos}
        />
      )}

      {aiEnabled && aiToolbarOpen && editable && (
        <AIToolbar
          editor={editor}
          position={aiToolbarPos}
          onAction={(action) => {
            const { from, to } = editor.state.selection;
            const selectedText = editor.state.doc.textBetween(from, to, " ");
            handleAIAction(action, selectedText, from, to);
          }}
          isProcessing={aiProcessing}
        />
      )}
    </div>
  );
}

/**
 * OttoEditor — a Tiptap-based collaborative rich text editor with AI features.
 */
export function OttoEditor(props: OttoEditorProps) {
  if (props.collaborative && props.documentId) {
    return (
      <YjsProvider documentId={props.documentId} user={props.user}>
        <OttoEditorInner {...props} />
      </YjsProvider>
    );
  }

  return <OttoEditorInner {...props} />;
}
