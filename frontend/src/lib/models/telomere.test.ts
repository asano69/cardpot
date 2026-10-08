import { describe, expect, it } from "vitest";
import { telomereEntries, telomereThickness } from "./telomere";

describe("telomereEntries", () => {
  it("maps line meta to read entries keyed by the same line id", () => {
    expect(
      telomereEntries({ "1:2": { userId: "u", name: "alice", at: 5 } }),
    ).toEqual({ "1:2": { updatedAt: 5, user: "alice", status: "read" } });
  });
});

describe("telomereThickness", () => {
  it("gets thinner as the edit gets older", () => {
    expect(telomereThickness(0)).toBe(10);
    expect(telomereThickness(59_999)).toBe(10);
    expect(telomereThickness(60_000)).toBe(8);
    expect(telomereThickness(3_600_000)).toBe(6);
    expect(telomereThickness(86_400_000)).toBe(5);
  });
});
