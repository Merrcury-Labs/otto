"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  FileText,
  Plus,
  MagnifyingGlass,
  ArrowLeft,
} from "@phosphor-icons/react";
import { graphqlFetch } from "../../lib/graphql/client";

interface LessonDoc {
  id: string;
  title: string;
  content: string;
  sectionName?: string;
  course?: { id: string; name: string } | null;
  module?: { id: string; title: string } | null;
}

export default function EditorListPage() {
  const router = useRouter();
  const [documents, setDocuments] = useState<LessonDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function loadDocuments() {
      try {
        const data = await graphqlFetch<{
          lessons: LessonDoc[];
        }>({
          query: /* GraphQL */ `
            query Lessons {
              lessons {
                id
                title
                content
                sectionName
                course { id name }
                module { id title }
              }
            }
          `,
          operationName: "Lessons",
        });
        setDocuments(data.lessons ?? []);
      } catch (error) {
        console.error("Failed to load documents:", error);
      } finally {
        setLoading(false);
      }
    }
    loadDocuments();
  }, []);

  const filtered = documents.filter(
    (doc) =>
      doc.title.toLowerCase().includes(search.toLowerCase()) ||
      (doc.content ?? "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-border/10 bg-background/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-5xl items-center gap-4 px-6 py-4">
          <button
            type="button"
            onClick={() => router.push("/")}
            className="p-2 rounded-md cursor-btn-hover focus-warm transition-all duration-150 text-muted-foreground hover:text-foreground"
            title="Back to dashboard"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-xl font-semibold text-foreground">
              Content Editor
            </h1>
            <p className="text-xs text-muted-foreground">
              Create and edit reading content for your courses
            </p>
          </div>
          <div className="ml-auto">
            <button
              type="button"
              onClick={() => router.push("/editor/new")}
              className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium bg-primary text-primary-foreground cursor-btn-hover focus-warm transition-all duration-150"
            >
              <Plus className="h-4 w-4" />
              New Document
            </button>
          </div>
        </div>
      </header>

      {/* Search */}
      <div className="mx-auto max-w-5xl px-6 pt-6">
        <div className="relative">
          <MagnifyingGlass className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search documents..."
            className="w-full rounded-lg border border-border/10 bg-surface-100 py-2.5 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-ring/20"
          />
        </div>
      </div>

      {/* Document Grid */}
      <div className="mx-auto max-w-5xl px-6 py-6">
        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-40 rounded-xl border border-border/10 bg-surface-100 animate-pulse"
              />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border/10 py-20 text-center">
            <FileText className="h-12 w-12 mb-4 text-muted-foreground" />
            <h3 className="text-lg font-medium text-foreground">
              {search ? "No documents found" : "No documents yet"}
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {search
                ? "Try a different search term"
                : "Create your first document to get started"}
            </p>
            {!search && (
              <button
                type="button"
                onClick={() => router.push("/editor/new")}
                className="mt-4 flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium bg-primary text-primary-foreground cursor-btn-hover focus-warm transition-all duration-150"
              >
                <Plus className="h-4 w-4" />
                New Document
              </button>
            )}
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((doc) => (
              <button
                key={doc.id}
                type="button"
                onClick={() => router.push(`/editor/${doc.id}`)}
                className="group text-left rounded-xl border border-border/10 bg-surface-100 p-5 transition-all duration-150 hover:border-border/30 hover:shadow-sm cursor-btn-hover focus-warm"
              >
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-medium text-foreground line-clamp-1">
                    {doc.title || "Untitled"}
                  </h3>
                  <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
                </div>
                {/* Excerpt from content */}
                <p className="mt-2 text-sm text-muted-foreground line-clamp-3">
                  {doc.content
                    ? extractExcerpt(doc.content, 120)
                    : "Empty document"}
                </p>
                {/* Meta */}
                <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                  {doc.course && (
                    <span className="rounded-full bg-surface-300 px-2 py-0.5">
                      {doc.course.name}
                    </span>
                  )}
                  {doc.module && (
                    <span className="rounded-full bg-surface-300 px-2 py-0.5">
                      {doc.module.title}
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/** Extract a plain-text excerpt from content (handles both markdown and ProseMirror JSON). */
function extractExcerpt(content: string, maxLength: number): string {
  try {
    const parsed = JSON.parse(content);
    if (parsed.type === "doc" && parsed.content) {
      // ProseMirror JSON — extract text nodes
      const text = extractTextFromNodes(parsed.content);
      return text.length > maxLength ? text.slice(0, maxLength) + "…" : text;
    }
  } catch {
    // Not JSON — treat as markdown/plain text
  }
  return content.length > maxLength ? content.slice(0, maxLength) + "…" : content;
}

function extractTextFromNodes(nodes: unknown[]): string {
  return nodes
    .map((node) => {
      if (typeof node === "string") return node;
      if (typeof node === "object" && node !== null) {
        const n = node as Record<string, unknown>;
        if (n.text) return n.text as string;
        if (n.content && Array.isArray(n.content)) return extractTextFromNodes(n.content);
      }
      return "";
    })
    .join(" ");
}
