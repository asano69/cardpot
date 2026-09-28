import { describe, expect, it } from "vitest";

import { parseDescription } from "./parseDescription";

describe("parseDescription", () => {
  it("parses the first line like any other line (no title handling)", () => {
    expect(parseDescription("[page] rest")).toEqual([
      { kind: "wikilink", text: "page" },
      { kind: "text", text: " rest" },
    ]);
  });

  it("returns nothing for an empty description", () => {
    expect(parseDescription("")).toEqual([]);
  });

  it("strips decorations but keeps a wiki link inside them", () => {
    expect(parseDescription("[* a [b] c]")).toEqual([
      { kind: "text", text: "a " },
      { kind: "wikilink", text: "b" },
      { kind: "text", text: " c" },
    ]);
  });

  it("strips combined decorations", () => {
    expect(parseDescription("[*/ text]")).toEqual([
      { kind: "text", text: "text" },
    ]);
  });

  it("uses the label of an external link, or its URL without one", () => {
    expect(parseDescription("[label https://e.com/]")).toEqual([
      { kind: "external-link", text: "label" },
    ]);
    expect(parseDescription("[https://e.com/ label]")).toEqual([
      { kind: "external-link", text: "label" },
    ]);
    expect(parseDescription("[https://e.com/]")).toEqual([
      { kind: "external-link", text: "https://e.com/" },
    ]);
  });

  it("keeps a bare URL as an external link", () => {
    expect(parseDescription("see https://e.com/ now")).toEqual([
      { kind: "text", text: "see " },
      { kind: "external-link", text: "https://e.com/" },
      { kind: "text", text: " now" },
    ]);
  });

  it("drops image notation", () => {
    expect(parseDescription("x [https://e.com/a.png] y")).toEqual([
      { kind: "text", text: "x  y" },
    ]);
    expect(parseDescription("[https://e.com/a.png https://e.com/]")).toEqual(
      [],
    );
  });

  it("marks up inline code and hashtags", () => {
    expect(parseDescription("`x` #tag rest")).toEqual([
      { kind: "inline-code", text: "x" },
      { kind: "text", text: " " },
      { kind: "hashtag", text: "#tag" },
      { kind: "text", text: " rest" },
    ]);
  });

  it("strips the quote mark", () => {
    expect(parseDescription("> hi")).toEqual([{ kind: "text", text: "hi" }]);
  });

  it("keeps unsupported notation as source text", () => {
    expect(parseDescription("[$ x]")).toEqual([
      { kind: "text", text: "[$ x]" },
    ]);
  });

  it("keeps an unclosed bracket as plain text", () => {
    expect(parseDescription("[* abc")).toEqual([
      { kind: "text", text: "[* abc" },
    ]);
  });

  it("keeps line breaks between lines", () => {
    expect(parseDescription("a\n[b]")).toEqual([
      { kind: "text", text: "a\n" },
      { kind: "wikilink", text: "b" },
    ]);
  });
});
