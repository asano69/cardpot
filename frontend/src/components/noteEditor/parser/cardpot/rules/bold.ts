import type { InlineContext } from "@lezer/markdown";

// "[* text]": an opening "[* " (bracket, asterisk, space), one or
// more characters that aren't "[", "]", or a newline, then a closing
// "]".
export function parseBold(
  cx: InlineContext,
  _next: number,
  pos: number,
): number {
  if (cx.slice(pos, pos + 3) !== "[* ") return -1;
  let i = pos + 3;
  const contentStart = i;
  while (
    i < cx.end &&
    cx.char(i) !== 91 &&
    cx.char(i) !== 93 &&
    cx.char(i) !== 10
  ) {
    i++;
  }
  if (i === contentStart || cx.char(i) !== 93) return -1;
  return cx.addElement(
    cx.elt("Bold", pos, i + 1, [
      cx.elt("BoldMark", pos, pos + 3),
      cx.elt("BoldMark", i, i + 1),
    ]),
  );
}
