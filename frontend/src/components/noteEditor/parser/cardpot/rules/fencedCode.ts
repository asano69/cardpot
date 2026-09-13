import type { BlockContext, Line } from "@lezer/markdown";

// A closing fence line: "```" optionally followed by trailing
// horizontal whitespace, and nothing else.
// Matches a Markdown-style fenced code block: an opening line
// starting with "```" (optionally followed by a language tag, e.g.
// "```js" -- consumed as part of the opening fence, not used for
// syntax highlighting yet), then any number of lines, up to and
// including a line that is exactly "```" (trailing whitespace
// allowed). Unlike every other rule in this parser, this one is
// block-scoped: it deliberately spans multiple lines.
//
// The opening fence must start at the beginning of a line -- a
// "```" appearing mid-line (e.g. inside a sentence) is not a code
// block. An unterminated fence (no matching closing "```" anywhere in
// the rest of the document) does not match at all and is left as
// plain text, the same "give up rather than guess" behavior as inline
// Code.
export function parseFencedCode(cx: BlockContext, line: Line): boolean {
  if (line.pos !== 0 || !line.text.startsWith("```")) return false;

  // An eager block parser must not advance the context unless it owns the
  // block. Check for the closing fence first so an unfinished fence retains
  // the legacy behavior of being parsed as ordinary paragraph text.
  const input = cx as unknown as {
    input: { length: number; read(from: number, to: number): string };
  };
  const remainingLines = input.input
    .read(cx.lineStart, input.input.length)
    .split("\n");
  if (
    !remainingLines.slice(1).some((candidate) => /^```[ \t]*$/.test(candidate))
  ) {
    return false;
  }

  const from = cx.lineStart;
  const openingTo = from + line.text.length;
  const children = [cx.elt("FencedCodeMark", from, openingTo)];

  while (cx.nextLine()) {
    if (/^```[ \t]*$/.test(line.text)) {
      children.push(
        cx.elt("FencedCodeMark", cx.lineStart, cx.lineStart + line.text.length),
      );
      cx.addElement(
        cx.elt("FencedCode", from, cx.lineStart + line.text.length, children),
      );
      cx.nextLine();
      return true;
    }
  }

  return false;
}
