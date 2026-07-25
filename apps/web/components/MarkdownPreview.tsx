"use client";

import ReactMarkdown from "react-markdown";
import rehypeKatex from "rehype-katex";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";

interface MarkdownPreviewProps {
  content: string;
  compact?: boolean;
}

type ProseMirrorMark = {
  type?: string;
  attrs?: { href?: string };
};

type ProseMirrorNode = {
  type?: string;
  text?: string;
  attrs?: { level?: number };
  marks?: ProseMirrorMark[];
  content?: ProseMirrorNode[];
};

function nodeToMarkdown(node: ProseMirrorNode): string {
  if (node.type === "text") {
    return (node.marks ?? []).reduce((text, mark) => {
      if (mark.type === "bold") return `**${text}**`;
      if (mark.type === "italic") return `*${text}*`;
      if (mark.type === "code") return `\`${text}\``;
      if (mark.type === "link" && mark.attrs?.href) {
        return `[${text}](${mark.attrs.href})`;
      }
      return text;
    }, node.text ?? "");
  }

  if (node.type === "hardBreak") return "\n";
  const children = node.content?.map(nodeToMarkdown).join("") ?? "";

  if (node.type === "heading") {
    const level = Math.min(Math.max(node.attrs?.level ?? 1, 1), 6);
    return `${"#".repeat(level)} ${children}\n\n`;
  }
  if (node.type === "paragraph") return `${children}\n\n`;
  if (node.type === "blockquote") {
    return `${children.trim().split("\n").map((line) => `> ${line}`).join("\n")}\n\n`;
  }
  if (node.type === "codeBlock") return `\`\`\`\n${children}\n\`\`\`\n\n`;
  if (node.type === "bulletList") {
    return `${(node.content ?? []).map((item) => `- ${nodeToMarkdown(item).trim()}\n`).join("")}\n`;
  }
  if (node.type === "orderedList") {
    return `${(node.content ?? []).map((item, index) => `${index + 1}. ${nodeToMarkdown(item).trim()}\n`).join("")}\n`;
  }
  return children;
}

function normalizeEditorContent(content: string): string {
  try {
    const document = JSON.parse(content) as ProseMirrorNode;
    return document.type === "doc" ? nodeToMarkdown(document).trim() : content;
  } catch {
    return content;
  }
}

export function MarkdownPreview({
  content,
  compact = false,
}: MarkdownPreviewProps) {
  if (!content.trim()) {
    return <p className="text-sm text-muted-foreground">No content available yet.</p>;
  }

  return (
    <div className="markdown-content min-w-0 text-foreground">
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeKatex]}
        components={{
          h1: ({ children }) => (
            <h1 className={compact ? "my-2 text-xl font-bold" : "mb-3 mt-6 text-3xl font-bold"}>
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className={compact ? "my-2 text-lg font-semibold" : "mb-2 mt-6 text-2xl font-semibold"}>
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className={compact ? "my-2 font-semibold" : "mb-2 mt-5 text-xl font-semibold"}>
              {children}
            </h3>
          ),
          p: ({ children }) => (
            <p className={compact ? "my-1.5" : "my-3 leading-7"}>{children}</p>
          ),
          a: ({ children, href }) => (
            <a href={href} target="_blank" rel="noreferrer" className="underline underline-offset-2">
              {children}
            </a>
          ),
          blockquote: ({ children }) => (
            <blockquote className="my-3 border-l-2 border-border pl-3 italic text-muted-foreground">
              {children}
            </blockquote>
          ),
          ul: ({ children }) => (
            <ul className="my-3 list-disc space-y-1 pl-5">{children}</ul>
          ),
          ol: ({ children }) => (
            <ol className="my-3 list-decimal space-y-1 pl-5">{children}</ol>
          ),
          table: ({ children }) => (
            <div className="my-4 max-w-full overflow-x-auto rounded-lg border">
              <table className="w-full border-collapse text-left text-xs">
                {children}
              </table>
            </div>
          ),
          th: ({ children }) => (
            <th className="border-b border-r bg-muted px-3 py-2 font-semibold last:border-r-0">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="border-b border-r px-3 py-2 align-top last:border-r-0">
              {children}
            </td>
          ),
          pre: ({ children }) => (
            <pre className="my-3 overflow-x-auto rounded-lg bg-muted p-3 text-xs">
              {children}
            </pre>
          ),
          code: ({ children, className }) => (
            <code className={className ?? "rounded bg-muted px-1 py-0.5 font-mono text-[0.9em]"}>
              {children}
            </code>
          ),
        }}
      >
        {normalizeEditorContent(content)}
      </ReactMarkdown>
    </div>
  );
}
