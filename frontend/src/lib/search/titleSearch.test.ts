import { describe, expect, it } from "vitest";
import {
  normalizeForSearch,
  searchTitles,
  type TitleEntry,
} from "./titleSearch";

const entry = (title: string): TitleEntry => ({
  title,
  key: normalizeForSearch(title),
});

function search(titles: string[], query: string, limit = 20): string[] {
  return searchTitles(titles.map(entry), query, limit);
}

describe("normalizeForSearch", () => {
  it("lowercases and unifies character width", () => {
    expect(normalizeForSearch("ＡＢＣ")).toBe("abc");
  });

  it("folds katakana into hiragana", () => {
    expect(normalizeForSearch("カタカナ")).toBe("かたかな");
  });

  it("turns brackets, underscores and any whitespace into one space", () => {
    expect(normalizeForSearch("[Foo_Bar\u3000 baz]")).toBe("foo bar baz");
  });
});

describe("searchTitles", () => {
  it("finds a substring, shorter titles first", () => {
    expect(search(["Application", "apple", "banana"], "ppl")).toEqual([
      "apple",
      "Application",
    ]);
  });

  it("puts a prefix match before a substring match", () => {
    expect(search(["xapple", "apple"], "app")).toEqual(["apple", "xapple"]);
  });

  it("finds Japanese text anywhere in a title", () => {
    expect(search(["入力日本語", "日本語入力", "りんご"], "日本語")).toEqual([
      "日本語入力",
      "入力日本語",
    ]);
  });

  it("finds hiragana with katakana and the other way round", () => {
    expect(search(["りんご"], "リンゴ")).toEqual(["りんご"]);
  });

  it("matches every word of the query in any order", () => {
    expect(search(["Foo Bar Baz", "foo qux"], "baz foo")).toEqual([
      "Foo Bar Baz",
    ]);
  });

  it("matches the underscore form of a title with spaces", () => {
    expect(search(["Foo Bar"], "foo_b")).toEqual(["Foo Bar"]);
  });

  it("returns the shortest titles for an empty query, up to the limit", () => {
    expect(search(["ccc", "a", "bb"], "", 2)).toEqual(["a", "bb"]);
  });

  it("returns nothing when no title matches", () => {
    expect(search(["apple"], "zzz")).toEqual([]);
  });
});
