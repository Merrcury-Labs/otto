"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  FloppyDisk,
  Check,
  Spinner,
  Sparkle,
} from "@phosphor-icons/react";
import { OttoEditor } from "@repo/editor";
import { graphqlFetch } from "../../../lib/graphql/client";

interface LessonData {
  id: string;
  title: string;
  content: string;
  sectionName?: string;
  course?: { id: string; name: string } | null;
  module?: { id: string; title: string } | null;
}

type SaveStatus = "idle" | "saving" | "saved" | "error";

export default function EditorPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const isNew = id === "new";

  const [document, setDocument] = useState<LessonData | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(!isNew);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const autoSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load existing document
  useEffect(() => {
    if (isNew) {
      setDocument({ id: "", title: "", content: "" });
      setLoading(false);
      return;
    }

    async function loadDocument() {
      try {
        const data = await graphqlFetch<{
          lesson: LessonData;
        }>({
          query: /* GraphQL */ `
            query Lesson($id: ID!) {
              lesson(id: $id) {
                id
                title
                content
                sectionName
                course { id name }
                module { id title }
              }
            }
          `,
          variables: { id },
          operationName: "Lesson",
        });
        setDocument(data.lesson);
        setTitle(data.lesson.title ?? "");
        setContent(data.lesson.content ?? "");
      } catch (error) {
        console.error("Failed to load document:", error);
      } finally {
        setLoading(false);
      }
    }
    loadDocument();
  }, [id, isNew]);

  const scheduleAutoSave = useCallback(
    (newTitle: string, newContent: string) => {
      if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
      autoSaveTimerRef.current = setTimeout(() => {
        saveDocument(newTitle, newContent);
      }, 3000);
    },
    [id, isNew]
  );

  const saveDocument = useCallback(
    async (saveTitle: string, saveContent: string) => {
      if (!saveTitle.trim() && !saveContent.trim()) return;
      setSaveStatus("saving");

      try {
        if (isNew) {
          const data = await graphqlFetch<{
            createLesson: { id: string; title: string };
          }>({
            query: /* GraphQL */ `
              mutation CreateLesson($title: String!, $content: String!, $length: String!) {
                createLesson(title: $title, content: $content, length: $length) { id title }
              }
            `,
            variables: { title: saveTitle || "Untitled", content: saveContent, length: "00:00:00" },
            operationName: "CreateLesson",
          });
          if (data.createLesson?.id) router.replace(`/editor/${data.createLesson.id}`);
        } else {
          await graphqlFetch<{
            updateLesson: { id: string; title: string };
          }>({
            query: /* GraphQL */ `
              mutation UpdateLesson($id: ID!, $title: String, $content: String) {
                updateLesson(id: $id, title: $title, content: $content) { id title }
              }
            `,
            variables: { id, title: saveTitle || "Untitled", content: saveContent },
            operationName: "UpdateLesson",
          });
        }
        setSaveStatus("saved");
        setTimeout(() => setSaveStatus("idle"), 2000);
      } catch (error) {
        console.error("Failed to save document:", error);
        setSaveStatus("error");
      }
    },
    [id, isNew, router]
  );

  const handleContentChange = useCallback(
    (json: string) => {
      setContent(json);
      scheduleAutoSave(title, json);
    },
    [title, scheduleAutoSave]
  );

  const handleTitleChange = useCallback(
    (newTitle: string) => {
      setTitle(newTitle);
      scheduleAutoSave(newTitle, content);
    },
    [content, scheduleAutoSave]
  );

  // Ctrl+S
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "s") {
        e.preventDefault();
        saveDocument(title, content);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [title, content, saveDocument]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="flex items-center gap-3 text-muted-foreground">
          <Spinner className="h-5 w-5 animate-spin" />
          <span>Loading document…</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col bg-surface-200">
      {/* ── Title Bar ── like Google Docs */}
      <header className="flex items-center gap-3 bg-background border-b border-border/5 px-3 py-1.5">
        <button
          type="button"
          onClick={() => router.push("/editor")}
          className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-surface-100 hover:text-foreground"
          title="Back to documents"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>

        {/* Breadcrumb */}
        {document?.course && (
          <>
            <span className="text-xs text-muted-foreground">{document.course.name}</span>
            <span className="text-muted-foreground/40">›</span>
          </>
        )}
        {document?.module && (
          <>
            <span className="text-xs text-muted-foreground">{document.module.title}</span>
            <span className="text-muted-foreground/40">›</span>
          </>
        )}

        {/* Document title — inline editable */}
        <input
          type="text"
          value={title}
          onChange={(e) => handleTitleChange(e.target.value)}
          placeholder="Untitled document"
          className="flex-1 bg-transparent text-sm font-medium text-foreground placeholder:text-muted-foreground/40 outline-none"
        />

        {/* Save status */}
        <div className="flex items-center gap-1.5 text-xs min-w-[80px] justify-end">
          {saveStatus === "saving" && (
            <>
              <Spinner className="h-3 w-3 animate-spin text-muted-foreground" />
              <span className="text-muted-foreground">Saving</span>
            </>
          )}
          {saveStatus === "saved" && (
            <>
              <Check className="h-3 w-3 text-brand-success" />
              <span className="text-brand-success">Saved</span>
            </>
          )}
          {saveStatus === "error" && (
            <span className="text-brand-error">Error</span>
          )}
        </div>

        <button
          type="button"
          onClick={() => saveDocument(title, content)}
          disabled={saveStatus === "saving"}
          className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium bg-primary text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
        >
          <FloppyDisk className="h-3.5 w-3.5" />
          Save
        </button>
      </header>

      {/* ── Editor with fixed toolbar ── Google Docs layout */}
      <OttoEditor
        content={content}
        onChange={handleContentChange}
        placeholder="Start writing your content…"
        minHeight="600px"
        aiEnabled
        collaborative={!!id && id !== "new"}
        documentId={id !== "new" ? `lesson-${id}` : undefined}
        format="auto"
        variant="gdocs"
        showToolbar
        showWordCount
      />

      {/* ── Bottom status bar ── */}
      <footer className="flex items-center justify-between border-t border-border/5 bg-background px-4 py-1 text-[11px] text-muted-foreground shrink-0">
        <div className="flex items-center gap-3">
          <span>
            {content
              ? `${Math.round(JSON.stringify(content).length / 1024)} KB`
              : "0 KB"}
          </span>
          <span className="flex items-center gap-1">
            <Sparkle className="h-3 w-3" />
            AI enabled
          </span>
        </div>
        <span>
          {id !== "new" ? `ID: ${id}` : "New document"} · ⌘S to save
        </span>
      </footer>
    </div>
  );
}
