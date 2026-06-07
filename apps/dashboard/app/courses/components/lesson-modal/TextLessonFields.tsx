"use client";

import { useState } from "react";
import {
  Code,
  Code as CodeIcon,
  Link,
  ListBullets,
  TextB,
  TextH,
  TextItalic,
} from "@phosphor-icons/react";
import { MarkdownPreview } from "./MarkdownPreview";
import { LessonFormData } from "./types";

interface TextLessonFieldsProps {
  lessonFormData: LessonFormData;
  onContentChange: (content: string) => void;
}

export function TextLessonFields({
  lessonFormData,
  onContentChange,
}: TextLessonFieldsProps) {
  const [showMarkdownPreview, setShowMarkdownPreview] = useState(false);

  const insertMarkdown = (before: string, after: string = "") => {
    const textarea = document.querySelector(
      'textarea[name="markdown-editor"]'
    ) as HTMLTextAreaElement | null;

    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const newText =
      text.substring(0, start) +
      before +
      text.substring(start, end) +
      after +
      text.substring(end);

    onContentChange(newText);

    setTimeout(() => {
      textarea.focus();
      textarea.selectionStart = textarea.selectionEnd =
        start + before.length + (end - start);
    }, 0);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between mb-2">
        <label className="text-sm font-medium text-foreground">
          Reading Content (Markdown Supported)
        </label>
        <button
          type="button"
          onClick={() => setShowMarkdownPreview(!showMarkdownPreview)}
          className={`text-sm px-3 py-1 rounded-md cursor-btn-hover focus-warm transition-all duration-150 ${
            showMarkdownPreview ? "bg-card text-foreground" : "bg-surface-100 text-foreground"
          }`}
        >
          {showMarkdownPreview ? "Edit" : "Preview"}
        </button>
      </div>

      {showMarkdownPreview ? (
        <div
          className="w-full px-4 py-3 rounded-md bg-surface-100 border border-border/10 text-foreground"
          style={{ fontSize: "14px", lineHeight: "1.6" }}
        >
          <MarkdownPreview content={lessonFormData.content || ""} />
        </div>
      ) : (
        <>
          <div
            className="flex flex-wrap gap-2 p-2 rounded-md bg-surface-100 border border-border/10"
          >
            <button
              type="button"
              onClick={() => insertMarkdown("**", "**")}
              className="p-2 rounded cursor-btn-hover focus-warm transition-all duration-150 bg-card text-foreground"
              title="Bold"
            >
              <TextB className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => insertMarkdown("*", "*")}
              className="p-2 rounded cursor-btn-hover focus-warm transition-all duration-150 bg-card text-foreground"
              title="Italic"
            >
              <TextItalic className="h-4 w-4" />
            </button>
            <div
              className="w-px bg-border/20"
            />
            <button
              type="button"
              onClick={() => insertMarkdown("# ")}
              className="p-2 rounded cursor-btn-hover focus-warm transition-all duration-150 bg-card text-foreground"
              title="Heading"
            >
              <TextH className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => insertMarkdown("`", "`")}
              className="p-2 rounded cursor-btn-hover focus-warm transition-all duration-150 bg-card text-foreground"
              title="Inline Code"
            >
              <CodeIcon className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => insertMarkdown("```", "\n```")}
              className="p-2 rounded cursor-btn-hover focus-warm transition-all duration-150 bg-card text-foreground"
              title="Code Block"
            >
              <Code className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => insertMarkdown("- ")}
              className="p-2 rounded cursor-btn-hover focus-warm transition-all duration-150 bg-card text-foreground"
              title="List"
            >
              <ListBullets className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => insertMarkdown("1. ")}
              className="p-2 rounded cursor-btn-hover focus-warm transition-all duration-150 bg-card text-foreground"
              title="Numbered List"
            >
              <span className="text-xs font-semibold">1.</span>
            </button>
            <div
              className="w-px bg-border/20"
            />
            <button
              type="button"
              onClick={() => insertMarkdown("> ")}
              className="p-2 rounded cursor-btn-hover focus-warm transition-all duration-150 bg-card text-foreground"
              title="Quote"
            >
              <span className="text-xs font-semibold">&quot;</span>
            </button>
            <button
              type="button"
              onClick={() => insertMarkdown("[", "](url)")}
              className="p-2 rounded cursor-btn-hover focus-warm transition-all duration-150 bg-card text-foreground"
              title="Link"
            >
              <Link className="h-4 w-4" />
            </button>
          </div>

          <textarea
            name="markdown-editor"
            value={lessonFormData.content || ""}
            onChange={(e) => onContentChange(e.target.value)}
            placeholder="Write your reading content in markdown...

# Heading
## Subheading

**Bold** and *italic* text

- List item 1
- List item 2

`inline code`

[Link text](https://example.com)"
            rows={8}
            className="w-full px-4 py-3 rounded-md cursor-btn-hover focus-warm transition-all duration-150 resize-none font-mono text-sm bg-surface-100 border border-border/10 text-foreground"
          />
          <p className="text-xs text-muted-foreground">
            Supports headings, bold, italic, links, code, quotes, bullet lists, and numbered lists.
          </p>
        </>
      )}
    </div>
  );
}
