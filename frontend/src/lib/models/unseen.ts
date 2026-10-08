import * as Y from "yjs";
import { lineIdAt, type LineId } from "./lineId";

// What a user has seen of a card: Yjs client id -> next clock of that client
// (a state vector as a plain object, like the server's "seen" field).
export type Seen = Record<string, number>;

// Per-client maximum. Clocks only grow, so merging in any order, any number
// of times, gives the same result.
export function mergeSeen(a: Seen, b: Seen): Seen {
  const merged = { ...a };
  for (const [client, clock] of Object.entries(b)) {
    if (clock > (merged[client] ?? 0)) merged[client] = clock;
  }
  return merged;
}

// The state vector of a doc, as a Seen.
export function seenOf(ydoc: Y.Doc): Seen {
  const seen: Seen = {};
  const vector = Y.decodeStateVector(Y.encodeStateVector(ydoc));
  for (const [client, clock] of vector) seen[String(client)] = clock;
  return seen;
}

// Ranges [from, to) of the text whose characters the baseline has not seen.
// An item covers the clocks [id.clock, id.clock + length), so its characters
// with clock >= baseline[client] are unseen. Deleted characters do not count.
//
// This is the only place that reads Y.Text's internal item list (_start),
// which is not public API: a Yjs upgrade that breaks it fails unseen.test.ts.
function unseenRanges(ytext: Y.Text, baseline: Seen): [number, number][] {
  const ranges: [number, number][] = [];
  let index = 0;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  for (let item = (ytext as any)._start; item; item = item.right) {
    if (item.deleted || !item.countable) continue;
    const seenClock = baseline[String(item.id.client)] ?? 0;
    const skip = Math.max(0, seenClock - item.id.clock);
    if (skip < item.length) {
      const from = index + skip;
      const to = index + item.length;
      const last = ranges[ranges.length - 1];
      if (last && last[1] === from) last[1] = to;
      else ranges.push([from, to]);
    }
    index += item.length;
  }
  return ranges;
}

// The ids of the lines holding characters the baseline has not seen.
//
// A line owns the characters from the "\n" before it to the end of its text
// (the same range its id is taken from). An unseen "\n" therefore marks both
// the line it ends and the line it starts, since a split changes both.
export function linesWithUnseenChars(
  ytext: Y.Text,
  baseline: Seen,
): Set<LineId> {
  const ranges = unseenRanges(ytext, baseline);
  const ids = new Set<LineId>();
  if (ranges.length === 0) return ids;

  const text = ytext.toString();
  const starts = [0];
  for (let i = 0; i < text.length; i++) {
    if (text[i] === "\n") starts.push(i + 1);
  }

  // Index of the line containing `pos` (the last start <= pos).
  const lineOf = (pos: number) => {
    let low = 0;
    let high = starts.length - 1;
    while (low < high) {
      const mid = (low + high + 1) >> 1;
      if (starts[mid] <= pos) low = mid;
      else high = mid - 1;
    }
    return low;
  };

  const lines = new Set<number>();
  for (const [from, to] of ranges) {
    let last = lineOf(to - 1);
    if (text[to - 1] === "\n") last++; // the line the newline starts
    for (let n = lineOf(from); n <= last; n++) lines.add(n);
  }

  for (const n of lines) {
    const id = lineIdAt(ytext, starts[n]);
    if (id) ids.add(id);
  }
  return ids;
}
