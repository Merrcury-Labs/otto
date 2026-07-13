"use client";

import { useMemo } from "react";
import { useEditor as useTiptapEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Highlight from "@tiptap/extension-highlight";
import Typography from "@tiptap/extension-typography";
import CharacterCount from "@tiptap/extension-character-count";
import Collaboration from "@tiptap/extension-collaboration";
import CollaborationCursor from "@tiptap/extension-collaboration-cursor";
import { detectAndConvert } from "../serialization/markdown-to-prosemirror";
import {
  CodeBlock,
  LinkExtension,
  ImageExtension,
  PlaceholderExtension,
} from "../extensions";
import type { EditorUser } from "../types";
import { useYjsProvider } from "../providers/yjs-provider";

interface UseOttoEditorOptions {
  content: string;
  onChange?: (json: string) => void;
  editable?: boolean;
  placeholder?: string;
  collaborative?: boolean;
  documentId?: string;
  user?: EditorUser;
  format?: "prosemirror" | "markdown" | "auto";
}

export function useOttoEditor({
  content,
  onChange,
  editable = true,
  placeholder,
  collaborative = false,
  user,
  format = "auto",
}: UseOttoEditorOptions) {
  const { doc, provider } = useYjsProvider();

  // Convert content to ProseMirror JSON based on format hint
  const resolvedContent =
    format === "prosemirror" ? content : detectAndConvert(content);

  // Tiptap's `content` prop expects a parsed JSON object, not a string.
  // If the resolved content is a JSON string, parse it into an object.
  // If it's plain markdown or empty, Tiptap handles it as text.
  let parsedContent: string | Record<string, unknown> = resolvedContent;
  try {
    const parsed = JSON.parse(resolvedContent);
    if (parsed && typeof parsed === "object" && parsed.type === "doc") {
      parsedContent = parsed;
    }
  } catch {
    // Not JSON — leave as-is (markdown or plain text)
  }

  // Build extensions list — collaboration extensions only when provider is available
  const extensions = useMemo(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const base: any[] = [
      StarterKit.configure({
        codeBlock: false, // Replaced by CodeBlock with lowlight
        heading: { levels: [1, 2, 3] },
        // Disable history when using Yjs collaboration (Yjs handles undo/redo)
        history: collaborative ? false : undefined,
      }),
      CodeBlock,
      LinkExtension,
      ImageExtension,
      PlaceholderExtension.configure({
        placeholder: placeholder ?? "Start writing…",
      }),
      Highlight.configure({ multicolor: false }),
      Typography,
      CharacterCount,
    ];

    // Add collaboration extensions when provider is available
    if (collaborative && doc && provider) {
      base.push(
        Collaboration.configure({
          document: doc,
        })
      );

      if (user) {
        base.push(
          CollaborationCursor.configure({
            provider,
            user: {
              name: user.name,
              color: user.color,
              colorLight: user.color + "33",
            },
          })
        );
      }
    }

    return base;
  }, [collaborative, doc, provider, user, placeholder]);

  const editor = useTiptapEditor({
    extensions,
    // In collaborative mode, content comes from the Yjs document
    content: collaborative && doc ? undefined : parsedContent,
    editable,
    onUpdate: ({ editor: e }) => {
      if (onChange) {
        onChange(JSON.stringify(e.getJSON()));
      }
    },
    editorProps: {
      attributes: {
        class: "otto-editor-body outline-none",
      },
    },
  });

  return editor;
}
