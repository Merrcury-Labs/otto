import { describe, it, expect } from "vitest";
import {
  detectAndConvert,
  isProsemirrorDoc,
  emptyDoc,
} from "./markdown-to-prosemirror";

describe("isProsemirrorDoc", () => {
  it("returns true for a valid ProseMirror doc", () => {
    expect(isProsemirrorDoc({ type: "doc", content: [] })).toBe(true);
  });

  it("returns false for null", () => {
    expect(isProsemirrorDoc(null)).toBe(false);
  });

  it("returns false for a non-doc object", () => {
    expect(isProsemirrorDoc({ type: "paragraph" })).toBe(false);
  });

  it("returns false for a string", () => {
    expect(isProsemirrorDoc("doc")).toBe(false);
  });

  it("returns false for an object missing content", () => {
    expect(isProsemirrorDoc({ type: "doc" })).toBe(false);
  });
});

describe("emptyDoc", () => {
  it("returns a valid ProseMirror empty doc JSON string", () => {
    const result = JSON.parse(emptyDoc());
    expect(result.type).toBe("doc");
    expect(result.content).toHaveLength(1);
    expect(result.content[0].type).toBe("paragraph");
  });
});

describe("detectAndConvert", () => {
  it("returns an empty doc for empty/whitespace input", () => {
    const result = JSON.parse(detectAndConvert(""));
    expect(result.type).toBe("doc");
  });

  it("returns an empty doc for whitespace-only input", () => {
    const result = JSON.parse(detectAndConvert("   "));
    expect(result.type).toBe("doc");
  });

  it("returns existing ProseMirror JSON unchanged", () => {
    const doc = JSON.stringify({
      type: "doc",
      content: [{ type: "paragraph", content: [{ type: "text", text: "hi" }] }],
    });
    expect(detectAndConvert(doc)).toBe(doc);
  });

  it("converts plain text to ProseMirror JSON", () => {
    const result = detectAndConvert("Hello world");
    const parsed = JSON.parse(result);
    expect(parsed.type).toBe("doc");
    expect(parsed.content).toBeDefined();
    expect(parsed.content.length).toBeGreaterThan(0);
  });

  it("converts markdown to ProseMirror JSON", () => {
    const result = detectAndConvert("# Heading\n\n**bold** text");
    const parsed = JSON.parse(result);
    expect(parsed.type).toBe("doc");
    expect(parsed.content.length).toBeGreaterThan(0);
  });
});
