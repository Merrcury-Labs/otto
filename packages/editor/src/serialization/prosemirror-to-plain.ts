/**
 * Extract plain text from a ProseMirror JSON string.
 * Used for quiz question text fields that need plain text for the GraphQL API.
 */
export function extractPlainText(json: string): string {
  if (!json.trim()) return "";

  try {
    const parsed = JSON.parse(json);
    if (parsed.type !== "doc") {
      // Not ProseMirror JSON — return as-is
      return json;
    }
    return extractTextFromDoc(parsed);
  } catch {
    return json;
  }
}

interface ProseMirrorNode {
  type: string;
  content?: ProseMirrorNode[];
  text?: string;
  marks?: { type: string; attrs?: Record<string, unknown> }[];
}

function extractTextFromDoc(doc: ProseMirrorNode): string {
  if (!doc.content) return "";

  return doc.content
    .map((block) => extractTextFromBlock(block))
    .filter(Boolean)
    .join("\n\n");
}

function extractTextFromBlock(block: ProseMirrorNode): string {
  if (block.type === "text" && block.text) {
    return block.text;
  }

  if (block.content) {
    return block.content
      .map((child) => extractTextFromBlock(child))
      .join("");
  }

  return "";
}
