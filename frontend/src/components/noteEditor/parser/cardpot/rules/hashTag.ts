import type { InlineContext } from "@lezer/markdown";

// A hashtag starts at the beginning of a line or immediately after whitespace,
// and continues through the next whitespace character. This mirrors Scrapbox's
// `(?:^|\\s)#\\S+` rule while keeping the preceding whitespace outside the
// syntax node.
export function parseHashTag(
  cx: InlineContext,
  next: number,
  pos: number,
): number {
  if (
    next !== 35 ||
    // Inline contexts used by table cells can start at a non-zero document
    // offset. Their first character is still a valid hashtag boundary.
    (pos > cx.offset && !/\s/.test(cx.slice(pos - 1, pos))) ||
    pos + 1 >= cx.end ||
    /\s/.test(cx.slice(pos + 1, pos + 2))
  ) {
    return -1;
  }

  let end = pos + 1;
  while (end < cx.end && !/\s/.test(cx.slice(end, end + 1))) end++;
  return cx.addElement(cx.elt("HashTag", pos, end));
}
