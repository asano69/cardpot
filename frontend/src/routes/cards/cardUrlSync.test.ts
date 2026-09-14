import { describe, expect, it } from "vitest";
import { shouldDeferServerSlugSync } from "./cardUrlSync";

describe("shouldDeferServerSlugSync", () => {
  it("keeps the locally edited slug until the title response is authoritative", () => {
    expect(shouldDeferServerSlugSync("renamed", "old-title")).toBe(true);
  });

  it("allows server synchronization when there is no optimistic rename", () => {
    expect(shouldDeferServerSlugSync(undefined, "old-title")).toBe(false);
  });
});
