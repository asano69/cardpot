import { describe, expect, it } from "vitest";
import { convert } from "./convert";

describe("convert: headings", () => {
  it("uses [** ] for the only heading depth in use", () => {
    expect(convert("## a")).toBe("[** a]\n");
  });

  it("keeps [** ] for the deepest depth and adds one asterisk per level above", () => {
    expect(convert("## a\n\n### b")).toBe("[*** a]\n\n[** b]\n");
  });

  it("ranks the depths in use, not the depths themselves", () => {
    expect(convert("#### a\n\n## b")).toBe("[** a]\n\n[*** b]\n");
  });
});

describe("convert: bold", () => {
  it("uses [[ ]] instead of [* ]", () => {
    expect(convert("x **bold**")).toBe("x [[bold]]\n");
  });

  it("works inside a heading", () => {
    expect(convert("## a **b**")).toBe("[** a [[b]]]\n");
  });
});
