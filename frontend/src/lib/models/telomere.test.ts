import { describe, expect, it } from "vitest";
import { telomereThickness } from "./telomere";

describe("telomereThickness", () => {
  it("gets thinner as the edit gets older", () => {
    expect(telomereThickness(0)).toBe(10);
    expect(telomereThickness(59_999)).toBe(10);
    expect(telomereThickness(60_000)).toBe(8);
    expect(telomereThickness(3_600_000)).toBe(6);
    expect(telomereThickness(86_400_000)).toBe(5);
  });
});
