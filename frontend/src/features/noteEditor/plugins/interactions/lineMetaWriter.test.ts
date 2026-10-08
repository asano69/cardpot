import { Text } from "@codemirror/state";
import * as Y from "yjs";
import { describe, expect, it } from "vitest";
import { lineIdAt } from "@/lib/models/lineId";
import { lineMetaMap } from "@/lib/models/lineMeta";
import { EditorState } from "@codemirror/state";
import { touchedLineStarts, writeLineMeta } from "./lineMetaWriter";

function startsTouchedBy(doc: string, from: number, insert: string) {
  const tr = EditorState.create({ doc }).update({
    changes: { from, insert },
  });
  return touchedLineStarts(tr.changes, tr.startState.doc, tr.state.doc);
}

describe("touchedLineStarts", () => {
  it("counts only the new line when Enter is pressed at the end of a line", () => {
    expect(startsTouchedBy("t\nP\nQ", 3, "\n")).toEqual([4]);
  });

  it("counts both lines when a line is split in the middle", () => {
    expect(startsTouchedBy("t\nabcdef\nQ", 5, "\n")).toEqual([2, 6]);
  });

  it("counts only the typed line for ordinary typing", () => {
    expect(startsTouchedBy("t\nabc\nQ", 3, "X")).toEqual([2]);
  });
});

const alice = { id: "u1", name: "alice" };

function setup(text: string) {
  const ydoc = new Y.Doc();
  const ytext = ydoc.getText("content");
  ytext.insert(0, text);
  return { ydoc, ytext, doc: Text.of(text.split("\n")) };
}

describe("writeLineMeta", () => {
  it("records the user under the id of the line", () => {
    const { ydoc, ytext, doc } = setup("t\nabc");
    expect(writeLineMeta(ydoc, doc, [3], alice, 100)).toBe(true);
    expect(lineMetaMap(ydoc).get(lineIdAt(ytext, 2)!)).toEqual({
      userId: "u1",
      name: "alice",
      at: 100,
    });
  });

  it("overwrites the entry of a line that is edited again", () => {
    const { ydoc, doc } = setup("t\nabc");
    writeLineMeta(ydoc, doc, [2], alice, 100);
    writeLineMeta(ydoc, doc, [2], { id: "u2", name: "bob" }, 200);
    const map = lineMetaMap(ydoc);
    expect(map.size).toBe(1);
    expect([...map.values()][0]).toMatchObject({ userId: "u2", at: 200 });
  });

  it("writes nothing while the editor and the Y.Text differ", () => {
    const { ydoc, doc } = setup("t\nabc");
    ydoc.getText("content").insert(0, "x"); // the editor has not seen this yet
    expect(writeLineMeta(ydoc, doc, [2], alice, 100)).toBe(false);
    expect(lineMetaMap(ydoc).size).toBe(0);
  });

  it("is not undone by the text's undo manager", () => {
    const { ydoc, ytext, doc } = setup("t\nabc");
    const undo = new Y.UndoManager(ytext);
    writeLineMeta(ydoc, doc, [2], alice, 100);
    undo.undo();
    expect(lineMetaMap(ydoc).size).toBe(1);
  });
});
