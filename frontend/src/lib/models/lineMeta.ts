import * as Y from "yjs";
import { lineIdAt, type LineId } from "./lineId";

// Who edited a line last. Stored in the card's Y.Doc under LINE_META_MAP,
// keyed by LineId (see lineId.ts). Self-reported and display-only: it is never
// used to decide what is unread.
export interface LineMeta {
  userId: string;
  // Display name, copied at write time: other users' names cannot be looked
  // up from the client.
  name: string;
  // Epoch milliseconds on the writer's clock.
  at: number;
}

const LINE_META_MAP = "lineMeta";

// Origin of the transactions that write line meta, so they can be told apart
// from text edits.
export const LINE_META_ORIGIN = "lineMeta";

export function lineMetaMap(ydoc: Y.Doc): Y.Map<LineMeta> {
  return ydoc.getMap<LineMeta>(LINE_META_MAP);
}

// The ids of the lines a text event touched: every line an insertion spans,
// and the line a deletion happened in. Positions come from the event's delta,
// which is in the coordinates of the text after the change, so this must run
// while that is still the current text (i.e. inside the observer).
export function touchedLineIds(ytext: Y.Text, event: Y.YTextEvent): LineId[] {
  const text = ytext.toString();
  const ids = new Set<LineId>();

  // Adds the line holding `from` and every line that starts before `to`.
  const addLines = (from: number, to: number) => {
    from = Math.min(from, text.length);
    let start = from === 0 ? 0 : text.lastIndexOf("\n", from - 1) + 1;
    for (;;) {
      const id = lineIdAt(ytext, start);
      if (id) ids.add(id);
      const newline = text.indexOf("\n", start);
      if (newline === -1 || newline >= to) break;
      start = newline + 1;
    }
  };

  let pos = 0;
  for (const op of event.delta) {
    if (op.retain !== undefined) {
      pos += op.retain;
    } else if (op.insert !== undefined) {
      const length = typeof op.insert === "string" ? op.insert.length : 1;
      addLines(pos, pos + length);
      pos += length;
    } else if (op.delete !== undefined) {
      addLines(pos, pos);
    }
  }
  return [...ids];
}
