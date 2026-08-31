import { describe, it, expect } from "vitest";
import { prosemirrorToMarkdown } from "./prosemirror-to-markdown";

describe("prosemirrorToMarkdown", () => {
  it("returns empty string for empty input", () => {
    expect(prosemirrorToMarkdown("")).toBe("");
  });

  it("returns empty string for whitespace-only input", () => {
    expect(prosemirrorToMarkdown("   ")).toBe("");
  });

  it("returns the original string if it is not valid JSON", () => {
    expect(prosemirrorToMarkdown("already markdown")).toBe("already markdown");
  });

  it("returns the original string if JSON is not a ProseMirror doc", () => {
    const input = JSON.stringify({ type: "paragraph" });
    expect(prosemirrorToMarkdown(input)).toBe(input);
  });

  it("converts a ProseMirror doc with a paragraph to markdown", () => {
    const doc = JSON.stringify({
      type: "doc",
      content: [
        {
          type: "paragraph",
          content: [{ type: "text", text: "Hello world" }],
        },
      ],
    });
    const result = prosemirrorToMarkdown(doc);
    expect(result).toContain("Hello world");
  });

  it("converts a ProseMirror heading to markdown heading syntax", () => {
    const doc = JSON.stringify({
      type: "doc",
      content: [
        {
          type: "heading",
          attrs: { level: 1 },
          content: [{ type: "text", text: "Title" }],
        },
      ],
    });
    const result = prosemirrorToMarkdown(doc);
    expect(result).toContain("#");
    expect(result).toContain("Title");
  });
});
