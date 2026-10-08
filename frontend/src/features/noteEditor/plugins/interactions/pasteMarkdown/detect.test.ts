import { describe, expect, it } from "vitest";
import { looksLikeMarkdown } from "./detect";

// Name + text + expected result. Add a row when a rule changes.
const cases: [name: string, text: string, markdown: boolean][] = [
  ["plain text", "just text", false],
  ["heading", "# x", true],
  ["deeper heading", "## x", true],
  ["hashtag", "#tag", false],
  ["link", "[a](https://e.com/)", true],
  ["fenced code", "```ts\nx\n```", true],
  ["table", "| a | b |\n|---|---|\n| 1 | 2 |", true],
  ["single list line", "- a", false],
  ["two list lines", "- a\n- b", true],
  ["bare bracket", "[page]", false],
  ["quote", "> quote", false],
  ["scrapbox decoration beats markdown", "[* x]\n**y**", false],
  ["scrapbox code block beats markdown", "code:x\n\t# y", false],
  ["scrapbox notation in a code span does not veto", "# x\n`[- text]`", true],
  [
    "scrapbox notation in a fenced block does not veto",
    "# x\n```\n[* y]\n# z\n```",
    true,
  ],
  [
    "scrapbox notation outside a code span still vetoes",
    "`a` [* y]\n# x",
    false,
  ],
];

describe("looksLikeMarkdown", () => {
  for (const [name, text, expected] of cases) {
    it(name, () => expect(looksLikeMarkdown(text)).toBe(expected));
  }
});
