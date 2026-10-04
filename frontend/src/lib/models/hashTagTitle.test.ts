import { describe, expect, it } from "vitest";
import { hashTagTitle } from "./hashTagTitle";

describe("hashTagTitle", () => {
  it("removes the leading #", () => {
    expect(hashTagTitle("#tag")).toBe("tag");
  });

  it("removes only one #", () => {
    expect(hashTagTitle("##tag")).toBe("#tag");
  });
});
