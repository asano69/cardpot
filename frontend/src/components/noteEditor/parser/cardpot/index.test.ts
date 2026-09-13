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
});
