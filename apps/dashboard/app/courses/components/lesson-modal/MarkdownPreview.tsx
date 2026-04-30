"use client";

import { Fragment, ReactNode } from "react";

interface MarkdownPreviewProps {
  content: string;
}

function renderInlineMarkdown(text: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  const pattern = /(\[([^\]]+)\]\(([^)]+)\)|`([^`]+)`|\*\*([^*]+)\*\*|\*([^*]+)\*)/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > lastIndex) {
      nodes.push(text.slice(lastIndex, match.index));
    }

    if (match[2] && match[3]) {
      nodes.push(
        <a
          key={`${match.index}-link`}
          href={match[3]}
          target="_blank"
          rel="noreferrer"
          className="underline"
          style={{ color: "#26251e" }}
        >
          {match[2]}
        </a>
      );
    } else if (match[4]) {
      nodes.push(
        <code
          key={`${match.index}-code`}
          className="rounded px-1 py-0.5 text-sm"
          style={{ backgroundColor: "#e6e5e0", color: "#26251e" }}
        >
          {match[4]}
        </code>
      );
    } else if (match[5]) {
      nodes.push(
        <strong key={`${match.index}-strong`} style={{ color: "#26251e" }}>
          {match[5]}
        </strong>
      );
    } else if (match[6]) {
      nodes.push(
        <em key={`${match.index}-em`} style={{ color: "#26251e" }}>
          {match[6]}
        </em>
      );
    }

    lastIndex = pattern.lastIndex;
  }

  if (lastIndex < text.length) {
    nodes.push(text.slice(lastIndex));
  }

  return nodes;
}

function renderParagraph(text: string, key: string) {
  return (
    <p key={key} className="my-3" style={{ color: "#26251e" }}>
      {renderInlineMarkdown(text)}
    </p>
  );
}

export function MarkdownPreview({ content }: MarkdownPreviewProps) {
  if (!content.trim()) {
    return (
      <p className="text-sm" style={{ color: "rgba(38, 37, 30, 0.55)" }}>
        Nothing to preview yet. Start writing in markdown to see the lesson render.
      </p>
    );
  }

  const lines = content.split("\n");
  const blocks: ReactNode[] = [];
  let index = 0;

  while (index < lines.length) {
    const line = lines[index] ?? "";
    const trimmedLine = line.trim();

    if (!trimmedLine) {
      index += 1;
      continue;
    }

    if (trimmedLine.startsWith("```")) {
      const codeLines: string[] = [];
      index += 1;

      while (
        index < lines.length &&
        !(lines[index] ?? "").trim().startsWith("```")
      ) {
        codeLines.push(lines[index] ?? "");
        index += 1;
      }

      blocks.push(
        <pre
          key={`code-${index}`}
          className="my-4 overflow-x-auto rounded-lg p-4 text-sm"
          style={{ backgroundColor: "#e6e5e0", color: "#26251e" }}
        >
          <code>{codeLines.join("\n")}</code>
        </pre>
      );

      index += 1;
      continue;
    }

    if (/^###\s+/.test(trimmedLine)) {
      blocks.push(
        <h3
          key={`h3-${index}`}
          className="mt-5 mb-2 text-xl font-semibold"
          style={{ color: "#26251e" }}
        >
          {renderInlineMarkdown(trimmedLine.replace(/^###\s+/, ""))}
        </h3>
      );
      index += 1;
      continue;
    }

    if (/^##\s+/.test(trimmedLine)) {
      blocks.push(
        <h2
          key={`h2-${index}`}
          className="mt-6 mb-2 text-2xl font-semibold"
          style={{ color: "#26251e" }}
        >
          {renderInlineMarkdown(trimmedLine.replace(/^##\s+/, ""))}
        </h2>
      );
      index += 1;
      continue;
    }

    if (/^#\s+/.test(trimmedLine)) {
      blocks.push(
        <h1
          key={`h1-${index}`}
          className="mt-6 mb-3 text-3xl font-bold"
          style={{ color: "#26251e" }}
        >
          {renderInlineMarkdown(trimmedLine.replace(/^#\s+/, ""))}
        </h1>
      );
      index += 1;
      continue;
    }

    if (/^>\s+/.test(trimmedLine)) {
      blocks.push(
        <blockquote
          key={`quote-${index}`}
          className="my-4 border-l-2 pl-4 italic"
          style={{
            borderColor: "rgba(38, 37, 30, 0.2)",
            color: "rgba(38, 37, 30, 0.75)",
          }}
        >
          {renderInlineMarkdown(trimmedLine.replace(/^>\s+/, ""))}
        </blockquote>
      );
      index += 1;
      continue;
    }

    if (/^[-*]\s+/.test(trimmedLine)) {
      const items: string[] = [];

      while (
        index < lines.length &&
        /^[-*]\s+/.test((lines[index] ?? "").trim())
      ) {
        items.push((lines[index] ?? "").trim().replace(/^[-*]\s+/, ""));
        index += 1;
      }

      blocks.push(
        <ul key={`ul-${index}`} className="my-4 list-disc space-y-2 pl-5">
          {items.map((item, itemIndex) => (
            <li key={`${index}-${itemIndex}`} style={{ color: "#26251e" }}>
              {renderInlineMarkdown(item)}
            </li>
          ))}
        </ul>
      );
      continue;
    }

    if (/^\d+\.\s+/.test(trimmedLine)) {
      const items: string[] = [];

      while (
        index < lines.length &&
        /^\d+\.\s+/.test((lines[index] ?? "").trim())
      ) {
        items.push((lines[index] ?? "").trim().replace(/^\d+\.\s+/, ""));
        index += 1;
      }

      blocks.push(
        <ol key={`ol-${index}`} className="my-4 list-decimal space-y-2 pl-5">
          {items.map((item, itemIndex) => (
            <li key={`${index}-${itemIndex}`} style={{ color: "#26251e" }}>
              {renderInlineMarkdown(item)}
            </li>
          ))}
        </ol>
      );
      continue;
    }

    const paragraphLines: string[] = [];

    while (index < lines.length && (lines[index] ?? "").trim()) {
      const currentLine = (lines[index] ?? "").trim();
      if (
        /^```/.test(currentLine) ||
        /^#{1,3}\s+/.test(currentLine) ||
        /^>\s+/.test(currentLine) ||
        /^[-*]\s+/.test(currentLine) ||
        /^\d+\.\s+/.test(currentLine)
      ) {
        break;
      }

      paragraphLines.push(currentLine);
      index += 1;
    }

    blocks.push(
      renderParagraph(paragraphLines.join(" "), `p-${index}-${paragraphLines[0]}`)
    );
  }

  return <div>{blocks.map((block, blockIndex) => <Fragment key={blockIndex}>{block}</Fragment>)}</div>;
}
