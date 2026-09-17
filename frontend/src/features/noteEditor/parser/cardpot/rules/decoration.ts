import type { InlineContext } from "@lezer/markdown";

// Combining decoration characters in a single bracket (e.g. "[*/
// text]") requires nesting: Lezer node types are static, so there is
// no way to synthesize a "Bold+Italic" type per combination. Instead
// every recognized character gets its own node type, and the active
// marks are nested around the same source range in this fixed
// canonical order (outermost first) -- regardless of the order the
// characters actually appear in the source, so "[*/ text]" and
// "[/* text]" nest identically. Only the outermost nesting level
// carries the real open/close mark elements (isMark); every inner
// wrapper exists purely to apply its own revealStyle CSS class to
// that same range.
const MARKS = [
  { char: "*", node: "Bold" },
  { char: "/", node: "Italic" },
] as const;

const MARK_CODES = new Set(MARKS.map((m) => m.char.charCodeAt(0)));

// "[<marks>+ text]": an opening "[", one or more characters drawn
// from the recognized decoration set (any mix, e.g. "*/" or "//*"), a
// space, then content (recursively parsed as inline so nested
// WikiLink/Code/etc. still resolve), then a closing "]". Bracket
// depth is tracked while scanning for the closing "]" so nested
// brackets in the content (e.g. "[Link]") don't prematurely end the
// decoration.
export function parseDecoration(
  cx: InlineContext,
  next: number,
  pos: number,
): number {
  if (next !== 91 /* [ */) return -1;

  let i = pos + 1;
  while (i < cx.end && MARK_CODES.has(cx.char(i))) i++;
  if (i === pos + 1 || cx.char(i) !== 32 /* space */) return -1;

  const decos = cx.slice(pos + 1, i);
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

  // Active marks, in MARKS' canonical order -- not the order their
  // characters appeared in `decos`.
  const active = MARKS.filter((m) => decos.includes(m.char));

  // Recurse so nested WikiLink/Code/etc. inside the decoration still
  // resolve. Only the innermost wrapper actually holds these parsed
  // children; every wrapper around it just re-nests the same range.
  let children = cx.parser.parseInline(cx.slice(contentFrom, end), contentFrom);
  for (let k = active.length - 1; k > 0; k--) {
    children = [cx.elt(active[k].node, contentFrom, end, children)];
  }

  const outer = active[0].node;
  const outerMark = `${outer}Mark`;
  return cx.addElement(
    cx.elt(outer, pos, end + 1, [
      cx.elt(outerMark, pos, contentFrom),
      ...children,
      cx.elt(outerMark, end, end + 1),
    ]),
  );
}
