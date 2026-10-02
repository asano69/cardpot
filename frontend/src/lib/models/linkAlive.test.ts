import { describe, expect, it } from "vitest";
import { isLinkAlive } from "./linkAlive";

const card = (titleLc: string, target_titleLc: string[] = []) => ({
  titleLc,
  target_titleLc,
});

describe("isLinkAlive", () => {
  it("is alive when the target card exists", () => {
    expect(isLinkAlive("b", [card("b")], "a")).toBe(true);
  });

  it("is alive when another card links to the same target", () => {
    expect(isLinkAlive("ghost", [card("c", ["ghost"])], "a")).toBe(true);
  });

  it("is dead when nothing relates to the target", () => {
    expect(isLinkAlive("ghost", [card("c", ["x"])], "a")).toBe(false);
    expect(isLinkAlive("ghost", [], "a")).toBe(false);
  });

  it("treats a link to the card itself as alive", () => {
    expect(isLinkAlive("a", [], "a")).toBe(true);
  });
});
