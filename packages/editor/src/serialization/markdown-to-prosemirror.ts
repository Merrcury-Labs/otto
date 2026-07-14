import { schema as prosemirrorMarkdownSchema } from "prosemirror-markdown";

/**
 * Detect whether a string is ProseMirror JSON or legacy markdown/plain text.
 * If it's markdown, convert to ProseMirror JSON.
 * If it's already ProseMirror JSON, return as-is.
 *
 * Returns the ProseMirror JSON string.
 */
export function detectAndConvert(content: string): string {
  // Empty content — return a minimal ProseMirror doc
  if (!content.trim()) {
    return emptyDoc();
  }

  // Try parsing as JSON
  try {
    const parsed = JSON.parse(content);
    if (isProsemirrorDoc(parsed)) {
      return content;
    }
  } catch {
    // Not JSON — treat as markdown/plain text
  }

  // Convert markdown to ProseMirror JSON
  return markdownToProsemirror(content);
}

/**
 * Check if a parsed JSON object is a ProseMirror document.
 */
export function isProsemirrorDoc(data: unknown): data is ProsemirrorDoc {
  return (
    typeof data === "object" &&
    data !== null &&
    "type" in data &&
    (data as ProsemirrorDoc).type === "doc" &&
    "content" in data
  );
}

interface ProsemirrorDoc {
  type: "doc";
  content: unknown[];
}

/**
 * Convert a markdown string to ProseMirror JSON.
 */
export function markdownToProsemirror(markdown: string): string {
  // Parse markdown into a ProseMirror node using the default schema
  const doc = prosemirrorMarkdownSchema.nodeFromJSON(
    markdownToDocJSON(markdown)
  );
  return JSON.stringify(doc.toJSON());
}

/**
 * Minimal markdown-to-doc-JSON conversion.
 * Uses prosemirror-markdown's parser internally.
 */
function markdownToDocJSON(markdown: string): Record<string, unknown> {
  // Dynamic import alternative: use a simple heuristic-based converter
  // for the common markdown patterns used in the dashboard.
  //
  // The dashboard's existing markdown supports: headings, bold, italic,
  // inline code, code blocks, bullet lists, numbered lists, blockquotes, links.
  //
  // For a robust solution, we use the prosemirror-markdown parser.

  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { defaultMarkdownParser } = require("prosemirror-markdown");

  const doc = defaultMarkdownParser.parse(markdown);
  return doc.toJSON() as Record<string, unknown>;
}

/**
 * Return an empty ProseMirror document JSON string.
 */
export function emptyDoc(): string {
  return JSON.stringify({
    type: "doc",
    content: [
      {
        type: "paragraph",
      },
    ],
  });
}
