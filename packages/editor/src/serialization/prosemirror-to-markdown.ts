import { schema as prosemirrorMarkdownSchema } from "prosemirror-markdown";

/**
 * Convert a ProseMirror JSON string back to markdown.
 * Useful for the student-facing web app or external consumers.
 */
export function prosemirrorToMarkdown(json: string): string {
  if (!json.trim()) return "";

  try {
    const parsed = JSON.parse(json);
    if (parsed.type !== "doc") {
      // Not ProseMirror JSON — assume it's already markdown
      return json;
    }

    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { defaultMarkdownSerializer } = require("prosemirror-markdown");

    const doc = prosemirrorMarkdownSchema.nodeFromJSON(parsed);
    return defaultMarkdownSerializer.serialize(doc);
  } catch {
    // If parsing fails, return the original string
    return json;
  }
}
