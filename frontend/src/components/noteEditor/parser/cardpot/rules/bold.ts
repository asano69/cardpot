import type { InlineContext } from "@lezer/markdown";

// "[*...* text]": an opening "[", one or more "*" characters, a
// space, then one or more characters that aren't "[", "]", or a
// newline, then a closing "]". This is Phase 2 step 1 of
// docs/parser/plan.md: the asterisk count no longer has to be
// exactly one ("[* text]") -- any run of one or more "*" still
// produces a single "Bold" node. Turning the run length into a
// distinct emphasis level, and generalizing beyond "*" to the rest of
// cosy's DECO_CHARS, is deferred to a later step (see the plan doc);
// nesting other decorations inside this one is not needed yet since
// only "*" is recognized so far.
export function parseBold(
  cx: InlineContext,
  next: number,
  pos: number,
): number {
  if (next !== 91 /* [ */) return -1;

  let i = pos + 1;
  while (cx.char(i) === 42 /* * */) i++;
  if (i === pos + 1 || cx.char(i) !== 32 /* space */) return -1;

  const markEnd = i + 1; // just past the space
  let end = markEnd;
  while (
    end < cx.end &&
    cx.char(end) !== 91 &&
    cx.char(end) !== 93 &&
    cx.char(end) !== 10
  ) {
    end++;
  }
  if (end === markEnd || cx.char(end) !== 93) return -1;

  return cx.addElement(
    cx.elt("Bold", pos, end + 1, [
      cx.elt("BoldMark", pos, markEnd),
      cx.elt("BoldMark", end, end + 1),
    ]),
  );
}
