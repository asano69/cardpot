import * as Y from "yjs";

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
