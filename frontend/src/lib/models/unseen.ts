import * as Y from "yjs";
import { lineIdAt, type LineId } from "./lineId";
import { touchedLineStarts } from "./lineRange";

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

// The ids of the lines holding characters the baseline has not seen. Which
// lines an unseen range touches is decided by touchedLineStarts, the same rule
// the "updated" side uses (an Enter at the end of a line only marks the new
// line).
export function linesWithUnseenChars(
  ytext: Y.Text,
  baseline: Seen,
): Set<LineId> {
  const ranges = unseenRanges(ytext, baseline);
  const ids = new Set<LineId>();
  if (ranges.length === 0) return ids;

  const text = ytext.toString();
  for (const [from, to] of ranges) {
    for (const start of touchedLineStarts(text, from, to)) {
      const id = lineIdAt(ytext, start);
      if (id) ids.add(id);
    }
  }
  return ids;
}
