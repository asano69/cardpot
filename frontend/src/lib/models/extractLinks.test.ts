import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { extractLinks } from "./extractLinks";

// Shared with the Go test (internal/wikilink/fixture_test.go). The cases are
// the contract between the two parsers: the TS parser is the reference.
interface FixtureCase {
  name: string;
  text: string;
  links: { title: string; titleLc: string }[];
}

// Resolved from the working directory: under jsdom, import.meta.url is not a
// file: URL. vitest runs with frontend/ as the working directory, so the
// fixture sits one level up.
const fixture: FixtureCase[] = JSON.parse(
  readFileSync(resolve(process.cwd(), "../testdata/link-extraction.json"), "utf8"),
);

describe("link extraction fixture", () => {
  it("has uniquely named cases", () => {
    const names = fixture.map((c) => c.name);
    expect(fixture.length).toBeGreaterThan(0);
    expect(new Set(names).size).toBe(names.length);
  });

  for (const c of fixture) {
    it(c.name, () => expect(extractLinks(c.text)).toEqual(c.links));
  }
});
