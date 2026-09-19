import { describe, expect, it } from "vitest";

import { cardpotSyntaxLanguage, Indent, isIndent } from ".";

function tree(input: string): string {
  return cardpotSyntaxLanguage.parser.parse(input).toString();
}

function indentRanges(input: string): { from: number; to: number }[] {
  const ranges: { from: number; to: number }[] = [];
  const syntax = cardpotSyntaxLanguage.parser.parse(input);
  syntax.iterate({
    enter(node) {
      if (node.type === Indent) ranges.push({ from: node.from, to: node.to });
    },
  });
  return ranges;
}

describe("Cardpot Lezer syntax", () => {
  it("parses Cardpot inline notation only inside paragraph blocks", () => {
    expect(tree("plain [page] [* bold] `code`")).toBe(
      "Document(Paragraph(WikiLink(WikiLinkMark,WikiLinkMark),Bold(BoldMark,BoldMark),Code(CodeMark,CodeMark)))",
    );
    expect(tree("# not a CommonMark heading\n**not CommonMark bold**")).toBe(
      "Document(Paragraph,Paragraph)",
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

  it("structurally dispatches single brackets after finding their matching close", () => {
    expect(
      tree("[$ x + [y]] [me.icon*3] [/project/page] [N35.68,E139.76,Z14]"),
    ).toBe(
      "Document(Paragraph(Math,Icon,ProjectLink(ProjectLinkMark,ProjectLinkMark),GoogleMap))",
    );
    expect(tree("[a [b] c] [unterminated [page]")).toBe(
      "Document(Paragraph(WikiLink(WikiLinkMark,WikiLinkMark),WikiLink(WikiLinkMark,WikiLinkMark)))",
    );
  });

  it("classifies URLs by their structure rather than rule priority", () => {
    expect(
      tree(
        "[https://example.com/] [https://example.com/a.png] [https://example.com/a.png https://example.com/] [label https://example.com/] [https://example.com/ label]",
      ),
    ).toBe(
      "Document(Paragraph(ExternalLink(ExternalLinkMark,ExternalLinkMark),Image,LinkedImage,ExternalLink(ExternalLinkMark,ExternalLinkMark),ExternalLink(ExternalLinkMark,ExternalLinkMark)))",
    );
    expect(tree("[https://example.com/ label [page]]")).toBe(
      "Document(Paragraph(ExternalLink(ExternalLinkMark,WikiLink(WikiLinkMark,WikiLinkMark),ExternalLinkMark)))",
    );
  });

  it("parses double brackets as Strong and preserves nested bracket pairing", () => {
    expect(
      tree("[[strong [page]]] [[https://example.com/a.png]] [[me.icon]]"),
    ).toBe(
      "Document(Paragraph(Strong(StrongMark,WikiLink(WikiLinkMark,WikiLinkMark),StrongMark),Strong(StrongMark,StrongImage,StrongMark),Strong(StrongMark,StrongIcon,StrongMark)))",
    );
    expect(tree("[[]] [[unterminated]")).toBe(
      "Document(Paragraph(WikiLink(WikiLinkMark,WikiLinkMark)))",
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

  it("nests multiple decoration characters in MARKS' canonical order", () => {
    expect(tree("[*/ text]")).toBe(
      "Document(Paragraph(Bold(BoldMark,Italic,BoldMark)))",
    );
  });

  it("nests the same way regardless of the characters' order in the source", () => {
    expect(tree("[/* text]")).toBe(
      "Document(Paragraph(Bold(BoldMark,Italic,BoldMark)))",
    );
  });

  it("recurses into a combined decoration's content", () => {
    expect(tree("[*/ [Link]]")).toBe(
      "Document(Paragraph(Bold(BoldMark,Italic(WikiLink(WikiLinkMark,WikiLinkMark)),BoldMark)))",
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

  it("parses code: blocks until their indentation returns", () => {
    expect(
      tree("before\ncode:typescript\n\t[not-a-link]\n\tconst x = 1\nafter"),
    ).toBe("Document(Paragraph,CodeBlock(CodeBlockMark,Indent,Indent),Paragraph)");
    expect(tree("\tcode:main.rs(rust)\n\t\tfn main() {}\n\tnext")).toBe(
      "Document(CodeBlock(Indent,CodeBlockMark,Indent),Paragraph(Indent))",
    );
  });

  it("does not treat the removed fenced-code syntax as a block", () => {
    expect(tree("```ts\n[page]\n``` ")).toBe(
      "Document(Paragraph(Code(CodeMark,CodeMark)),Paragraph(WikiLink(WikiLinkMark,WikiLinkMark)),Paragraph(Code(CodeMark,CodeMark)))",
    );
  });

  it("parses tab-indented table rows and delegates each cell to inline rules", () => {
    expect(
      tree("table:links\n\t[* bold]\t[page]\t`code`\n\t#tag\t[ ]\t\noutside"),
    ).toBe(
      "Document(Table(TableMark,TableRow(Indent,TableCell(Bold(BoldMark,BoldMark)),TableCell(WikiLink(WikiLinkMark,WikiLinkMark)),TableCell(Code(CodeMark,CodeMark))),TableRow(Indent,TableCell(HashTag),TableCell(Blank),TableCell)),Paragraph)",
    );
  });

  it("terminates tables at equal or shallower indentation", () => {
    expect(tree("\ttable:nested\n\t\ta\tb\n\tnext\ntail")).toBe(
      "Document(Table(Indent,TableMark,TableRow(Indent,TableCell,TableCell)),Paragraph(Indent),Paragraph)",
    );
  });

  it("parses a quote line and delegates its content to Cardpot inline rules", () => {
    expect(tree("> [* bold] [page] `code`")).toBe(
      "Document(Quote(QuoteMark,Bold(BoldMark,BoldMark),WikiLink(WikiLinkMark,WikiLinkMark),Code(CodeMark,CodeMark)))",
    );
    expect(tree(">no separating space")).toBe("Document(Quote(QuoteMark))");
  });

  it("recognizes quote prefixes after any supported indentation", () => {
    expect(tree("  > indented quote")).toBe(
      "Document(Quote(Indent,QuoteMark))",
    );
    expect(tree("\t> indented quote")).toBe(
      "Document(Quote(Indent,QuoteMark))",
    );
  });

  it("records each non-blank line's ECMAScript whitespace indentation", () => {
    const input = "plain\n \t　nested\n\fother";
    expect(tree(input)).toBe(
      "Document(Paragraph,Paragraph(Indent),Paragraph(Indent))",
    );
    // The ranges themselves encode the character-count depth. `isIndent`
    // gives consumers a NodeProp-based way to recognize these semantic nodes.
    expect(indentRanges(input)).toEqual([
      { from: 6, to: 9 },
      { from: 16, to: 17 },
    ]);
    expect(Indent.prop(isIndent)).toBe(true);
  });

  it("consumes whitespace-only lines that Lezer itself does not treat as blank", () => {
    expect(tree("\u3000\n> quote\n\tnext")).toBe(
      "Document(Quote(QuoteMark),Paragraph(Indent))",
    );
  });

  it("records only the block's own indent level for deeper code/table rows", () => {
    expect(indentRanges("code:x\n\t\tfoo")).toEqual([{ from: 7, to: 8 }]);
    expect(indentRanges("table:x\n\t\ta\tb")).toEqual([{ from: 8, to: 9 }]);
  });

  it("uses the same indentation rule for code and table continuation rows", () => {
    expect(tree(" code:js\n  const x = 1\n　　nested\nafter")).toBe(
      "Document(CodeBlock(Indent,CodeBlockMark,Indent,Indent),Paragraph)",
    );
    expect(tree("　table:data\n　 a\tb\nnext")).toBe(
      "Document(Table(Indent,TableMark,TableRow(Indent,TableCell,TableCell)),Paragraph)",
    );
  });
});
