import { describe, expect, it } from "vitest";
import { touchedLineStarts } from "./lineRange";

describe("touchedLineStarts", () => {
  it("counts only the new line when Enter is pressed at the end of a line", () => {
    // "t\nP\n\nQ": a "\n" was inserted at offset 3.
    expect(touchedLineStarts("t\nP\n\nQ", 3, 4)).toEqual([4]);
  });

  it("counts both lines when a line is split in the middle", () => {
    // "t\nabc\ndef\nz": a "\n" was inserted at offset 5.
    expect(touchedLineStarts("t\nabc\ndef\nz", 5, 6)).toEqual([2, 6]);
  });

  it("counts only the typed line for ordinary typing", () => {
    expect(touchedLineStarts("t\nabXc\nz", 4, 5)).toEqual([2]);
  });

  it("counts the line of a deletion", () => {
    expect(touchedLineStarts("t\nac\nz", 3, 3)).toEqual([2]);
  });

  it("keeps the first line when the whole text is a new empty first line", () => {
    expect(touchedLineStarts("\nabc", 0, 4)).toEqual([0, 1]);
  });
});
