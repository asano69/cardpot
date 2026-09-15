import { describe, expect, it } from "vitest";

import { cardpotSyntaxLanguage } from ".";

function tree(input: string): string {
  return cardpotSyntaxLanguage.parser.parse(input).toString();
}

describe("Cardpot Lezer syntax", () => {
  it("parses Cardpot inline notation only inside paragraph blocks", () => {
    expect(tree("plain [page] [* bold] `code`")).toBe(
      "Document(Paragraph(WikiLink(WikiLinkMark,WikiLinkMark),Bold(BoldMark,BoldMark),Code(CodeMark,CodeMark)))",
    );
    expect(tree("# not a CommonMark heading\n**not CommonMark bold**")).toBe(
      "Document(Paragraph)",
    );
  });

  it("parses Scrapbox-compatible hashtags at whitespace boundaries", () => {
    expect(tree("#tag #hash#Tag This is a #second .")).toBe(
      "Document(Paragraph(HashTag,HashTag,HashTag))",
    );
    expect(tree("# →#notTag←")).toBe("Document(Paragraph)");
  });

  it("parses whitespace-only brackets as blanks before WikiLinks", () => {
    expect(tree("[ ] [　] [\t] [ 　 \t　\t ] [page]")).toBe(
      "Document(Paragraph(Blank,Blank,Blank,Blank,WikiLink(WikiLinkMark,WikiLinkMark)))",
    );
    // "[*** [ ]]" is now correctly recognized as a Bold decoration
    // wrapping a nested Blank, since parseDecoration tracks bracket
    // depth and recurses into its content (see the "recursively
    // parses a decoration's content" test above). The bare "[]" still
    // matches nothing (empty content) and stays as plain text.
    expect(tree("[] [*** [ ]]")).toBe(
      "Document(Paragraph(Bold(BoldMark,Blank,BoldMark)))",
    );
  });

  it("parses Bold regardless of how many asterisks are used", () => {
    expect(tree("[* one]")).toBe(
      "Document(Paragraph(Bold(BoldMark,BoldMark)))",
    );
    expect(tree("[** two]")).toBe(
      "Document(Paragraph(Bold(BoldMark,BoldMark)))",
    );
    expect(tree("[***** five]")).toBe(
      "Document(Paragraph(Bold(BoldMark,BoldMark)))",
    );
  });

  it("falls through to WikiLink when an asterisk run has no following space", () => {
    // No space after the asterisks -- Bold doesn't match, and the
    // content isn't whitespace-only either, so this still resolves to
    // a WikiLink, matching the old exact-"[* "-prefix behavior.
    expect(tree("[**]")).toBe(
      "Document(Paragraph(WikiLink(WikiLinkMark,WikiLinkMark)))",
    );
  });

  it("parses Italic through the same generic decoration dispatcher as Bold", () => {
    expect(tree("[/ italic]")).toBe(
      "Document(Paragraph(Italic(ItalicMark,ItalicMark)))",
    );
  });

  it("generalizes the repeated-character rule to Italic too", () => {
    expect(tree("[// two]")).toBe(
      "Document(Paragraph(Italic(ItalicMark,ItalicMark)))",
    );
  });

  it("recursively parses a decoration's content so a nested WikiLink still resolves", () => {
    // Unlike the old parseBold, which stopped scanning at the first "[",
    // the shared decoration dispatcher tracks bracket depth and re-parses
    // its content as inline, so a nested link inside the decoration works.
    expect(tree("[* [Link] text]")).toBe(
      "Document(Paragraph(Bold(BoldMark,WikiLink(WikiLinkMark,WikiLinkMark),BoldMark)))",
    );
  });

  it("recognizes a fenced block line by line and excludes its content from inline parsing", () => {
    expect(tree("before\n```ts\n[not-a-link]\n```\nafter")).toBe(
      "Document(Paragraph,FencedCode(FencedCodeMark,FencedCodeMark),Paragraph)",
    );
  });

  it("leaves an unterminated fence as normal paragraph text", () => {
    expect(tree("```\n[page]")).toBe(
      "Document(Paragraph(Code(CodeMark,CodeMark),WikiLink(WikiLinkMark,WikiLinkMark)))",
    );
  });

  it("parses a quote line and delegates its content to Cardpot inline rules", () => {
    expect(tree("> [* bold] [page] `code`")).toBe(
      "Document(Quote(QuoteMark,Bold(BoldMark,BoldMark),WikiLink(WikiLinkMark,WikiLinkMark),Code(CodeMark,CodeMark)))",
    );
    expect(tree(">no separating space")).toBe("Document(Quote(QuoteMark))");
  });

  it("only recognizes quote prefixes after space indentation", () => {
    expect(tree("  > indented quote")).toBe("Document(Quote(QuoteMark))");
    expect(tree("\t> not a cosy-style indented quote")).toBe(
      "Document(Paragraph)",
    );
  });
});
