import * as Y from "yjs";
import { describe, expect, it } from "vitest";
import { lineIdAt } from "./lineId";
import { touchedLineIds } from "./lineMeta";

// Applies `edit` to the text and returns the ids touched by the resulting event.
function touchedBy(text: string, edit: (ytext: Y.Text) => void) {
  const ytext = new Y.Doc().getText("content");
  ytext.insert(0, text);
  let ids: string[] = [];
  ytext.observe((event) => {
    ids = touchedLineIds(ytext, event);
  });
  edit(ytext);
  return { ids: new Set(ids), ytext };
}

describe("touchedLineIds", () => {
  it("reports only the line typed in", () => {
    const { ids, ytext } = touchedBy("t\nabc\nz", (y) => y.insert(3, "X"));
    expect(ids).toEqual(new Set([lineIdAt(ytext, 2)]));
  });

  it("reports both lines when a line is split", () => {
    const { ids, ytext } = touchedBy("t\nabcdef\nz", (y) => y.insert(5, "\n"));
    expect(ids).toEqual(new Set([lineIdAt(ytext, 2), lineIdAt(ytext, 6)]));
  });

  it("reports only the new line when Enter is pressed at the end of a line", () => {
    // Regression test: the line above, whose text did not change, was
    // reported too.
    const { ids, ytext } = touchedBy("t\nP\nQ", (y) => y.insert(3, "\n"));
    expect(ids).toEqual(new Set([lineIdAt(ytext, 4)]));
  });

  it("reports the line a deletion happened in", () => {
    const { ids, ytext } = touchedBy("t\nabc\nz", (y) => y.delete(3, 1));
    expect(ids).toEqual(new Set([lineIdAt(ytext, 2)]));
  });

  it("reports the first line when text is inserted at the very start", () => {
    const { ids, ytext } = touchedBy("\nabc", (y) => y.insert(0, "x"));
    expect(ids).toEqual(new Set([lineIdAt(ytext, 0)]));
  });
});
