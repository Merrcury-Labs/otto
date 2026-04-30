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
        <label className="text-sm font-medium" style={{ color: "#26251e" }}>
          Reading Content (Markdown Supported)
        </label>
        <button
          type="button"
          onClick={() => setShowMarkdownPreview(!showMarkdownPreview)}
          className="text-sm px-3 py-1 rounded-md cursor-btn-hover focus-warm transition-all duration-150"
          style={{
            backgroundColor: showMarkdownPreview ? "#e6e5e0" : "#f7f7f4",
            color: "#26251e",
          }}
        >
          {showMarkdownPreview ? "Edit" : "Preview"}
        </button>
      </div>

      {showMarkdownPreview ? (
        <div
          className="w-full px-4 py-3 rounded-md"
          style={{
            backgroundColor: "#f7f7f4",
            borderColor: "rgba(38, 37, 30, 0.1)",
            color: "#26251e",
            fontSize: "14px",
            lineHeight: "1.6",
          }}
        >
          <MarkdownPreview content={lessonFormData.content || ""} />
        </div>
      ) : (
        <>
          <div
            className="flex flex-wrap gap-2 p-2 rounded-md"
            style={{
              backgroundColor: "#f7f7f4",
              borderColor: "rgba(38, 37, 30, 0.1)",
            }}
          >
            <button
              type="button"
              onClick={() => insertMarkdown("**", "**")}
              className="p-2 rounded cursor-btn-hover focus-warm transition-all duration-150"
              style={{
                backgroundColor: "#e6e5e0",
                color: "#26251e",
              }}
              title="Bold"
            >
              <TextB className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => insertMarkdown("*", "*")}
              className="p-2 rounded cursor-btn-hover focus-warm transition-all duration-150"
              style={{
                backgroundColor: "#e6e5e0",
                color: "#26251e",
              }}
              title="Italic"
            >
              <TextItalic className="h-4 w-4" />
            </button>
            <div
              className="w-px"
              style={{ backgroundColor: "rgba(38, 37, 30, 0.2)" }}
            />
            <button
              type="button"
              onClick={() => insertMarkdown("# ")}
              className="p-2 rounded cursor-btn-hover focus-warm transition-all duration-150"
              style={{
                backgroundColor: "#e6e5e0",
                color: "#26251e",
              }}
              title="Heading"
            >
              <TextH className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => insertMarkdown("`", "`")}
              className="p-2 rounded cursor-btn-hover focus-warm transition-all duration-150"
              style={{
                backgroundColor: "#e6e5e0",
                color: "#26251e",
              }}
              title="Inline Code"
            >
              <CodeIcon className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => insertMarkdown("```", "\n```")}
              className="p-2 rounded cursor-btn-hover focus-warm transition-all duration-150"
              style={{
                backgroundColor: "#e6e5e0",
                color: "#26251e",
              }}
              title="Code Block"
            >
              <Code className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => insertMarkdown("- ")}
              className="p-2 rounded cursor-btn-hover focus-warm transition-all duration-150"
              style={{
                backgroundColor: "#e6e5e0",
                color: "#26251e",
              }}
              title="List"
            >
              <ListBullets className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => insertMarkdown("1. ")}
              className="p-2 rounded cursor-btn-hover focus-warm transition-all duration-150"
              style={{
                backgroundColor: "#e6e5e0",
                color: "#26251e",
              }}
              title="Numbered List"
            >
              <span className="text-xs font-semibold">1.</span>
            </button>
            <div
              className="w-px"
              style={{ backgroundColor: "rgba(38, 37, 30, 0.2)" }}
            />
            <button
              type="button"
              onClick={() => insertMarkdown("> ")}
              className="p-2 rounded cursor-btn-hover focus-warm transition-all duration-150"
              style={{
                backgroundColor: "#e6e5e0",
                color: "#26251e",
              }}
              title="Quote"
            >
              <span className="text-xs font-semibold">"</span>
            </button>
            <button
              type="button"
              onClick={() => insertMarkdown("[", "](url)")}
              className="p-2 rounded cursor-btn-hover focus-warm transition-all duration-150"
              style={{
                backgroundColor: "#e6e5e0",
                color: "#26251e",
              }}
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
            className="w-full px-4 py-3 rounded-md cursor-btn-hover focus-warm transition-all duration-150 resize-none font-mono text-sm"
            style={{
              backgroundColor: "#f7f7f4",
              borderColor: "rgba(38, 37, 30, 0.1)",
              color: "#26251e",
            }}
          />
          <p className="text-xs" style={{ color: "rgba(38, 37, 30, 0.55)" }}>
            Supports headings, bold, italic, links, code, quotes, bullet lists, and numbered lists.
          </p>
        </>
      )}
    </div>
  );
}
