import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

// Resolved from the working directory, like extractLinks.test.ts.
const root = resolve(process.cwd(), "src/styles");
const read = (file: string) => readFileSync(resolve(root, file), "utf8");

// The public tokens, copied from token.txt.
const PUBLIC_TOKENS = read("tokens.txt").split("\n").map((t) => t.trim()).filter(Boolean);

describe("design tokens", () => {
  const defaults = read("theme/default.css");

  it("declares every public token in the default preset", () => {
    const missing = PUBLIC_TOKENS.filter(
      (name) => !new RegExp(`^\\s*${name}:`, "m").test(defaults),
    );
    expect(missing).toEqual([]);
  });

  it("never gives a public token a fallback value at its use site", () => {
    const files = ["components/card-grid.css", "components/related.css", "components/page.css"];
    const offenders = files.filter((f) =>
      PUBLIC_TOKENS.some((name) => read(f).includes(`var(${name},`)),
    );
    expect(offenders).toEqual([]);
  });
});
