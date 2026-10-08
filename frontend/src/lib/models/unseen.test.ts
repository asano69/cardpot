import * as Y from "yjs";
import { describe, expect, it } from "vitest";
import { lineIdAt } from "./lineId";
import {
  linesWithUnseenChars,
  mergeSeen,
  seenOf,
  type Seen,
} from "./unseen";

function createText(text: string): Y.Text {
  const ytext = new Y.Doc().getText("content");
  ytext.insert(0, text);
  return ytext;
}

// A second replica of the same document, as another client would hold it.
function replicate(ytext: Y.Text): Y.Text {
  const doc = new Y.Doc();
  Y.applyUpdate(doc, Y.encodeStateAsUpdate(ytext.doc!));
  return doc.getText("content");
}

function pull(from: Y.Text, to: Y.Text): void {
  Y.applyUpdate(to.doc!, Y.encodeStateAsUpdate(from.doc!));
}

// The ids of the lines at the given (0-based) line numbers.
function idsOf(ytext: Y.Text, ...lines: number[]): Set<string> {
  const starts = [0];
  ytext
    .toString()
    .split("\n")
    .forEach((line, i, all) => {
      if (i < all.length - 1) starts.push(starts[i] + line.length + 1);
    });
  return new Set(lines.map((n) => lineIdAt(ytext, starts[n])!));
}

describe("mergeSeen", () => {
  it("takes the maximum per client, in any order", () => {
    const a: Seen = { "1": 5, "2": 3 };
    const b: Seen = { "1": 2, "3": 7 };
    const want = { "1": 5, "2": 3, "3": 7 };
    expect(mergeSeen(a, b)).toEqual(want);
    expect(mergeSeen(b, a)).toEqual(want);
  });
});

describe("linesWithUnseenChars", () => {
  it("marks every line when nothing has been seen", () => {
    const ytext = createText("t\na\nb");
    expect(linesWithUnseenChars(ytext, {})).toEqual(idsOf(ytext, 0, 1, 2));
  });

  it("marks nothing when the baseline is the current state", () => {
    const ytext = createText("t\na\nb");
    expect(linesWithUnseenChars(ytext, seenOf(ytext.doc!)).size).toBe(0);
  });

  it("marks only the line another client typed in", () => {
    const a = createText("t\nabc\nz");
    const baseline = seenOf(a.doc!);
    const b = replicate(a);
    b.insert(3, "X"); // inside "abc"
    pull(b, a);
    expect(linesWithUnseenChars(a, baseline)).toEqual(idsOf(a, 1));
  });

  it("marks both lines when another client splits a line", () => {
    const a = createText("t\nabcdef\nz");
    const baseline = seenOf(a.doc!);
    const b = replicate(a);
    b.insert(5, "\n"); // "t\nabc\ndef\nz"
    pull(b, a);
    expect(linesWithUnseenChars(a, baseline)).toEqual(idsOf(a, 1, 2));
  });

  it("does not count deleted characters", () => {
    const a = createText("t\nabc\ndef");
    const baseline = seenOf(a.doc!);
    const b = replicate(a);
    b.delete(5, 1); // joins "abc" and "def"
    pull(b, a);
    expect(linesWithUnseenChars(a, baseline).size).toBe(0);
  });

  it("splits an item at the baseline clock", () => {
    // One item holds "t\nabcd"; only its last two characters are unseen.
    const a = createText("t\nabcd");
    const baseline: Seen = { [String(a.doc!.clientID)]: 4 };
    expect(linesWithUnseenChars(a, baseline)).toEqual(idsOf(a, 1));
  });
});
