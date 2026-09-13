import type { InlineContext } from "@lezer/markdown";

// "[title]": a "[", one or more characters that aren't "[", "]", or a
// newline, then a closing "]". Content that is empty or made up
// entirely of whitespace does not count as a title, so "[]" and
// "[ ]" don't match. Checked after Bold's own rule, so "[* text]"
// is still recognized as Bold rather than a WikiLink (see the `rules`
// array order in index.ts).
export function parseWikiLink(
  cx: InlineContext,
  next: number,
  pos: number,
): number {
  if (next !== 91) return -1;
  let i = pos + 1;
  const contentStart = i;
  while (
    i < cx.end &&
    cx.char(i) !== 91 &&
    cx.char(i) !== 93 &&
    cx.char(i) !== 10
  ) {
    i++;
  }
  if (cx.char(i) !== 93 || cx.slice(contentStart, i).trim() === "") return -1;
  return cx.addElement(
    cx.elt("WikiLink", pos, i + 1, [
      cx.elt("WikiLinkMark", pos, pos + 1),
      cx.elt("WikiLinkMark", i, i + 1),
    ]),
  );
}
