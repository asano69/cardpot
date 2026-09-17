import type { InlineContext } from "@lezer/markdown";

// A Blank is a pair of brackets containing one or more whitespace characters.
// It must be recognized before the general bracket rules so that `[ ]` never
// becomes a WikiLink.
export function parseBlank(
  cx: InlineContext,
  next: number,
  pos: number,
): number {
  if (next !== 91) return -1;

  let end = pos + 1;
  while (end < cx.end && cx.char(end) !== 93 && cx.char(end) !== 10) end++;
  if (cx.char(end) !== 93) return -1;

  const content = cx.slice(pos + 1, end);
  if (content === "" || !/^\s+$/u.test(content)) return -1;
  return cx.addElement(cx.elt("Blank", pos, end + 1));
}
