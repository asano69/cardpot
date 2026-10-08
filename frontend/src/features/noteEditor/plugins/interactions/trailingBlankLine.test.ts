import { EditorState } from "@codemirror/state";
import { describe, expect, it } from "vitest";
import { syntheticAnnotation } from "../../userEdit";
import { trailingBlankLine } from "./trailingBlankLine";

function create(doc: string) {
  return EditorState.create({ doc, extensions: [trailingBlankLine] });
}

function type(doc: string, from: number, insert: string) {
  return create(doc).update({
    changes: { from, insert },
    selection: { anchor: from + insert.length },
    userEvent: "input",
  }).state;
}

describe("trailingBlankLine", () => {
  it("adds a blank line below an edited last line, keeping the caret on it", () => {
    const state = type("T\nab", 4, "c");
    expect(state.doc.toString()).toBe("T\nabc\n");
    expect(state.selection.main.head).toBe(5);
  });

  it("adds nothing when the document already ends with a blank line", () => {
    expect(type("T\nab\n", 4, "c").doc.toString()).toBe("T\nabc\n");
  });

  it("treats a whitespace-only last line as blank", () => {
    expect(type("T\n\t", 3, " ").doc.toString()).toBe("T\n\t ");
  });

  it("never extends the title line", () => {
    expect(type("", 0, "x").doc.toString()).toBe("x");
  });

  it("lets the user delete the blank line", () => {
    const state = create("T\nab\n").update({
      changes: { from: 4, to: 5 },
      userEvent: "delete.backward",
    }).state;
    expect(state.doc.toString()).toBe("T\nab");
  });

  it("does not add a blank line when text is deleted from the last line", () => {
    const state = create("T\nabc").update({
      changes: { from: 4, to: 5 },
      userEvent: "delete.backward",
    }).state;
    expect(state.doc.toString()).toBe("T\nab");
  });

  it("does not add a blank line when typing in a line above the last one", () => {
    const state = create("T\nab\ncd").update({
      changes: { from: 4, insert: "x" },
      userEvent: "input",
    }).state;
    expect(state.doc.toString()).toBe("T\nabx\ncd");
  });

  it("leaves synthetic transactions alone", () => {
    const state = create("T\nab").update({
      changes: { from: 4, insert: "c" },
      annotations: syntheticAnnotation.of(true),
    }).state;
    expect(state.doc.toString()).toBe("T\nabc");
  });
});
