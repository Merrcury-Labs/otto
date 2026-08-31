import { describe, it, expect } from "vitest";
import { extractPlainText } from "./prosemirror-to-plain";

describe("extractPlainText", () => {
  it("returns empty string for empty input", () => {
    expect(extractPlainText("")).toBe("");
  });

  it("returns empty string for whitespace-only input", () => {
    expect(extractPlainText("   ")).toBe("");
  });

  it("returns the original string if it is not valid JSON", () => {
    expect(extractPlainText("hello world")).toBe("hello world");
  });

  it("returns the original string if JSON is not a ProseMirror doc", () => {
    expect(extractPlainText(JSON.stringify({ type: "paragraph" }))).toBe(
      JSON.stringify({ type: "paragraph" })
    );
  });

  it("extracts text from a simple ProseMirror doc", () => {
    const doc = JSON.stringify({
      type: "doc",
      content: [
        {
          type: "paragraph",
          content: [{ type: "text", text: "Hello world" }],
        },
      ],
    });
    expect(extractPlainText(doc)).toBe("Hello world");
  });

  it("extracts text from multiple blocks separated by double newlines", () => {
    const doc = JSON.stringify({
      type: "doc",
      content: [
        {
          type: "paragraph",
          content: [{ type: "text", text: "First paragraph" }],
        },
        {
          type: "paragraph",
          content: [{ type: "text", text: "Second paragraph" }],
        },
      ],
    });
    expect(extractPlainText(doc)).toBe(
      "First paragraph\n\nSecond paragraph"
    );
  });

  it("extracts text from nested inline content", () => {
    const doc = JSON.stringify({
      type: "doc",
      content: [
        {
          type: "paragraph",
          content: [
            { type: "text", text: "Hello " },
            { type: "text", text: "bold", marks: [{ type: "bold" }] },
            { type: "text", text: " world" },
          ],
        },
      ],
    });
    expect(extractPlainText(doc)).toBe("Hello bold world");
  });

  it("handles a doc with empty paragraphs", () => {
    const doc = JSON.stringify({
      type: "doc",
      content: [
        { type: "paragraph" },
        {
          type: "paragraph",
          content: [{ type: "text", text: "Text here" }],
        },
      ],
    });
    expect(extractPlainText(doc)).toBe("Text here");
  });

  it("handles a doc with no content", () => {
    const doc = JSON.stringify({ type: "doc" });
    expect(extractPlainText(doc)).toBe("");
  });
});
