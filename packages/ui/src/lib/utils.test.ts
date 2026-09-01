import { describe, it, expect } from "vitest";
import { cn } from "./utils";

describe("cn", () => {
  it("merges class names", () => {
    expect(cn("foo", "bar")).toBe("foo bar");
  });

  it("handles conditional classes", () => {
    const condition = false;
    expect(cn("base", condition && "hidden", "visible")).toBe("base visible");
  });

  it("deduplicates conflicting Tailwind classes", () => {
    // tailwind-merge should keep the last conflicting utility
    expect(cn("px-2", "px-4")).toBe("px-4");
  });

  it("deduplicates conflicting padding utilities", () => {
    expect(cn("p-2", "p-4")).toBe("p-4");
  });

  it("handles undefined and null inputs", () => {
    expect(cn("base", undefined, null, "end")).toBe("base end");
  });

  it("handles empty input", () => {
    expect(cn()).toBe("");
  });

  it("handles array inputs", () => {
    expect(cn(["foo", "bar"], "baz")).toBe("foo bar baz");
  });

  it("merges object-style class maps", () => {
    expect(cn({ active: true, disabled: false })).toBe("active");
  });
});
