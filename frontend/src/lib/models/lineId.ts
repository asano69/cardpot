import * as Y from "yjs";

// A line's identity, taken from Yjs instead of being assigned by the server:
// every character of a Y.Text has a CRDT id (client, clock) that is unique
// across all clients and survives any edit. The id of the "\n" in front of a
// line is therefore a stable id of that line.
//
// - Editing inside a line keeps its id.
// - Pressing Enter inside a line: the upper part keeps the id, the lower part
//   gets the id of the newly inserted "\n".
// - Joining a line with the previous one removes its "\n", so the upper line's
//   id survives.
// - Undo re-inserts a deleted "\n" as a new character, so a line restored by
//   undo gets a new id. Replacing the whole text (e.g. an import) renews every
//   id as well.
export type LineId = string; // "head" or "client:clock"

// The first line has no preceding newline, so it uses a fixed sentinel.
export const HEAD: LineId = "head";

// Returns the id of the line that starts at `lineStart`, an offset in the
// text. y-codemirror.next keeps CodeMirror offsets and Y.Text indexes
// identical, so CodeMirror's `line.from` can be passed as it is.
//
// Returns null when the character before `lineStart` does not exist, which
// means the text and the caller's document are out of step.
//
// The lookup walks the items of the Y.Text, so its cost grows with the number
// of items, not in constant time. Callers should only ask for visible lines.
export function lineIdAt(ytext: Y.Text, lineStart: number): LineId | null {
  if (lineStart === 0) return HEAD;
  const { item } = Y.createRelativePositionFromTypeIndex(ytext, lineStart - 1);
  return item ? `${item.client}:${item.clock}` : null;
}
