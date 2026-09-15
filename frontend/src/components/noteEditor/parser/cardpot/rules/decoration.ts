import type { InlineContext } from "@lezer/markdown";

// Generic decoration dispatcher: replaces the old "[* text]"-only Bold rule.
// At this step only a single decoration character (repeated any number of
// times, e.g. "***" or "//") is recognized -- combining distinct characters
// in one bracket (e.g. "[*/ text]") requires the nesting mechanism
// introduced in a later step (see docs/parser/plan-phase2.md, step 3).
const MARKS = [
  { code: 42 /* * */, node: "Bold" },
  { code: 47 /* / */, node: "Italic" },
] as const;

// "[<mark>+ text]": an opening "[", one or more of the same decoration
// character, a space, then content (recursively parsed as inline so nested
// WikiLink/Code/etc. still resolve -- unlike the old Bold rule, which never
// recursed), then a closing "]". Bracket depth is tracked while scanning for
// the closing "]" so nested brackets in the content (e.g. "[Link]") don't
// prematurely end the decoration.
export function parseDecoration(
  cx: InlineContext,
  next: number,
  pos: number,
): number {
  if (next !== 91 /* [ */) return -1;

  const markCode = cx.char(pos + 1);
  const mark = MARKS.find((m) => m.code === markCode);
  if (!mark) return -1;

  let i = pos + 1;
  while (cx.char(i) === mark.code) i++;
  if (cx.char(i) !== 32 /* space */) return -1;

  const contentFrom = i + 1;

  let depth = 0;
  let end = contentFrom;
  while (end < cx.end) {
    const ch = cx.char(end);
    if (ch === 10 /* newline */) return -1;
    if (ch === 91 /* [ */) depth++;
    else if (ch === 93 /* ] */) {
      if (depth === 0) break;
      depth--;
    }
    end++;
  }
  if (end === contentFrom || cx.char(end) !== 93) return -1;

  const children = cx.parser.parseInline(
    cx.slice(contentFrom, end),
    contentFrom,
  );

  const markName = `${mark.node}Mark`;
  return cx.addElement(
    cx.elt(mark.node, pos, end + 1, [
      cx.elt(markName, pos, contentFrom),
      ...children,
      cx.elt(markName, end, end + 1),
    ]),
  );
}
