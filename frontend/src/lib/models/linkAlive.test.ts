import { describe, expect, it } from "vitest";
import { deadLinks, isLinkAlive } from "./linkAlive";
import type { CardLinkRecord } from "./cardLink";

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

describe("deadLinks", () => {
  const link = (titleLc: string) =>
    ({ target_title: titleLc, target_titleLc: titleLc }) as CardLinkRecord;

  it("keeps only the links nothing relates to, in order", () => {
    const links = [link("b"), link("ghost2"), link("shared"), link("a")];
    const cards = [card("b"), card("c", ["shared"])];
    expect(deadLinks(links, cards, "a").map((l) => l.target_titleLc)).toEqual([
      "ghost2",
    ]);
  });
});
