import { describe, expect, it } from "vitest";
import { telomereEntries, telomereThickness } from "./telomere";

const meta = {
  "1:2": { userId: "alice", name: "Alice", at: 5 },
};
const none = new Set<string>();

describe("telomereEntries", () => {
  it("is read for a line edited by someone else with nothing new", () => {
    expect(telomereEntries(meta, none, none, "bob")).toEqual({
      "1:2": { updatedAt: 5, user: "Alice", status: "read" },
    });
  });

  it("gives an unread line without meta no time and no user", () => {
    expect(telomereEntries({}, new Set(["3:4"]), none, "bob")).toEqual({
      "3:4": { updatedAt: null, user: "", status: "unread" },
    });
  });

  it("lets updated win over unread", () => {
    const both = new Set(["1:2"]);
    expect(telomereEntries(meta, both, both, "bob")["1:2"].status).toBe(
      "updated",
    );
  });

  it("keeps the user's own unread lines read", () => {
    const unread = new Set(["1:2"]);
    expect(telomereEntries(meta, unread, none, "alice")["1:2"].status).toBe(
      "read",
    );
  });

  it("marks the user's own edit made after loading as updated", () => {
    const updated = new Set(["1:2"]);
    expect(telomereEntries(meta, none, updated, "alice")["1:2"].status).toBe(
      "updated",
    );
  });
});

describe("telomereThickness", () => {
  const hour = 3_600_000;

  it("starts at 10px and thins as the edit gets older", () => {
    expect(telomereThickness(0)).toBe(10);
    expect(telomereThickness(60_000)).toBe(10);
    expect(telomereThickness(hour)).toBe(9);
    expect(telomereThickness(8 * hour)).toBe(8);
    expect(telomereThickness(98 * hour)).toBe(6);
    expect(telomereThickness(1000 * hour)).toBe(4);
  });

  it("never goes below 1px", () => {
    expect(telomereThickness(100_000 * hour)).toBe(1);
    expect(telomereThickness(Infinity)).toBe(1);
  });

  it("treats a future edit as fresh", () => {
    expect(telomereThickness(-hour)).toBe(10);
  });
});
