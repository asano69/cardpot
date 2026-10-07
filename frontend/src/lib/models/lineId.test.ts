import * as Y from "yjs";
import { describe, expect, it } from "vitest";
import { HEAD, lineIdAt } from "./lineId";

function createText(text: string): Y.Text {
  const ytext = new Y.Doc().getText("content");
  ytext.insert(0, text);
  return ytext;
}

// The id of every line, in order.
function lineIds(ytext: Y.Text): (string | null)[] {
  const ids: (string | null)[] = [];
  let start = 0;
  for (const line of ytext.toString().split("\n")) {
    ids.push(lineIdAt(ytext, start));
    start += line.length + 1;
  }
  return ids;
}

// A second replica of the same document, as another client would hold it.
function replicate(ytext: Y.Text): Y.Text {
  const doc = new Y.Doc();
  Y.applyUpdate(doc, Y.encodeStateAsUpdate(ytext.doc!));
  return doc.getText("content");
}

function sync(a: Y.Text, b: Y.Text): void {
  const [docA, docB] = [a.doc!, b.doc!];
  Y.applyUpdate(docB, Y.encodeStateAsUpdate(docA));
  Y.applyUpdate(docA, Y.encodeStateAsUpdate(docB));
}

describe("lineIdAt", () => {
  it("gives the first line the HEAD sentinel and every other line its own id", () => {
    const ids = lineIds(createText("t\na\nb"));
    expect(ids[0]).toBe(HEAD);
    expect(new Set(ids).size).toBe(3);
    expect(ids.every((id) => id !== null)).toBe(true);
  });

  it("handles an empty text", () => {
    expect(lineIds(createText(""))).toEqual([HEAD]);
  });

  it("returns null for a position past the end of the text", () => {
    expect(lineIdAt(createText("t\na"), 100)).toBeNull();
  });

  it("keeps every id when text is typed inside a line", () => {
    const ytext = createText("t\nabc\nz");
    const before = lineIds(ytext);
    ytext.insert(3, "XYZ");
    expect(lineIds(ytext)).toEqual(before);
  });

  it("keeps the id of the upper part when Enter splits a line", () => {
    const ytext = createText("t\nabcdef\nz");
    const [head, line, last] = lineIds(ytext);
    ytext.insert(5, "\n"); // "t\nabc\ndef\nz"
    const after = lineIds(ytext);
    expect(after[0]).toBe(head);
    expect(after[1]).toBe(line);
    expect(after[3]).toBe(last);
    expect([head, line, last]).not.toContain(after[2]);
  });

  it("gives the original text a new id when Enter is pressed at the start of a line", () => {
    // The empty line above keeps the id; the text that moved down gets the
    // id of the new newline.
    const ytext = createText("t\nabcdef\nz");
    const before = lineIds(ytext);
    ytext.insert(2, "\n"); // "t\n\nabcdef\nz"
    const after = lineIds(ytext);
    expect(after[1]).toBe(before[1]);
    expect(after[2]).not.toBe(before[1]);
    expect(after[3]).toBe(before[2]);
  });

  it("keeps the id of the upper line when two lines are joined", () => {
    const ytext = createText("t\nabc\ndef");
    const before = lineIds(ytext);
    ytext.delete(5, 1); // "t\nabcdef"
    expect(lineIds(ytext)).toEqual(before.slice(0, 2));
  });

  it("gives a line restored by undo a new id", () => {
    const ytext = createText("t\nabc\nz");
    const undo = new Y.UndoManager(ytext);
    const before = lineIds(ytext);

    ytext.delete(1, 4); // "t\nz": the line "abc" is gone
    expect(lineIds(ytext)).toEqual([before[0], before[2]]);

    undo.undo();
    const after = lineIds(ytext);
    expect(ytext.toString()).toBe("t\nabc\nz");
    expect(after[1]).not.toBe(before[1]);
    expect(after[2]).toBe(before[2]);
  });

  it("gives every replica the same ids after concurrent edits", () => {
    const a = createText("t\nabc\nz");
    const b = replicate(a);

    a.insert(4, "\n"); // splits "abc" into "ab" and "c"
    b.insert(7, "!"); // appends to "z"
    sync(a, b);

    expect(a.toString()).toBe("t\nab\nc\nz!");
    expect(b.toString()).toBe(a.toString());
    expect(lineIds(b)).toEqual(lineIds(a));
  });
});
