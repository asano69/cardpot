import type { InlineContext } from "@lezer/markdown";

// An inline code span enclosed in a pair of backticks. The content
// may be empty and must not contain a backtick or a newline, so a
// code span never spans multiple lines.
export function parseInlineCode(
  cx: InlineContext,
  next: number,
  pos: number,
): number {
  if (next !== 96) return -1;
  let i = pos + 1;
  while (i < cx.end && cx.char(i) !== 96 && cx.char(i) !== 10) {
    i++;
  }
  if (cx.char(i) !== 96) return -1;
  return cx.addElement(
    cx.elt("Code", pos, i + 1, [
      cx.elt("CodeMark", pos, pos + 1),
      cx.elt("CodeMark", i, i + 1),
    ]),
  );
}
