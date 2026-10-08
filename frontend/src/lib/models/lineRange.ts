// The start offsets of the lines a range of inserted (or, with from === to,
// deleted) text touched. `text` is the text after the change and [from, to)
// is the range in it. Shared by the "updated" side (touchedLineIds in
// lineMeta.ts) and the "unread" side (linesWithUnseenChars in unseen.ts), so
// both always mark the same lines.
//
// Pressing Enter at the very end of a line adds a line below it without
// changing the line above: the inserted "\n" ends the upper line, but nothing
// of the upper line moved. Only the new line counts then. Enter in the middle
// of a line moves the rest of the text down, so both lines count.
export function touchedLineStarts(
  text: string,
  from: number,
  to: number,
): number[] {
  from = Math.min(from, text.length);
  const opensNewLine =
    from > 0 &&
    to > from &&
    text[from] === "\n" &&
    (text[to] === undefined || text[to] === "\n");

  let start = from === 0 ? 0 : text.lastIndexOf("\n", from - 1) + 1;
  if (opensNewLine) start = text.indexOf("\n", start) + 1;

  const starts: number[] = [];
  for (;;) {
    starts.push(start);
    const newline = text.indexOf("\n", start);
    if (newline === -1 || newline >= to) break;
    start = newline + 1;
  }
  return starts;
}
