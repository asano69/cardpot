import { describe, expect, it } from "vitest";
import { compareTitles } from "./compareTitles";

describe("compareTitles", () => {
  it("is 0 for equal titles", () => {
    expect(compareTitles("abc", "abc")).toBe(0);
  });

  it("puts uppercase before lowercase (byte order)", () => {
    expect(compareTitles("Zed", "banana")).toBeLessThan(0);
  });

  it("puts a prefix before the longer title", () => {
    expect(compareTitles("ab", "abc")).toBeLessThan(0);
  });

  it("orders by code point, not by UTF-16 unit", () => {
    // Hiragana U+3042, fullwidth A U+FF21, emoji U+1F600. The emoji's high
    // surrogate (U+D83D) is below U+FF21 in UTF-16, but its code point is above.
    const sorted = ["\u{1F600}", "\uFF21", "あ"].sort(compareTitles);
    expect(sorted).toEqual(["あ", "\uFF21", "\u{1F600}"]);
  });

  it("compares two surrogate pairs by code point", () => {
    expect(compareTitles("\u{1F600}", "\u{1F601}")).toBeLessThan(0);
  });
});
