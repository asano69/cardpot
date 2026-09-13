import { NodeType } from "@lezer/common";
import { revealStyle, isMark, type Rule, type RuleMatch } from "../nodeProps";

export const WikiLink = NodeType.define({
  id: 5,
  name: "WikiLink",
  props: [[revealStyle, "cm-wikilink"]],
});

export const WikiLinkMark = NodeType.define({
  id: 6,
  name: "WikiLinkMark",
  props: [[isMark, true]],
});

// "[title]": a "[", one or more characters that aren't "[", "]", or a
// newline, then a closing "]". Content that is empty or made up
// entirely of whitespace does not count as a title, so "[]" and
// "[ ]" don't match. Checked after Bold's own rule, so "[* text]"
// is still recognized as Bold rather than a WikiLink (see the `rules`
// array order in index.ts).
function matchWikiLink(text: string, pos: number): RuleMatch | null {
  if (text[pos] !== "[") return null;
  let i = pos + 1;
  const contentStart = i;
  while (
    i < text.length &&
    text[i] !== "[" &&
    text[i] !== "]" &&
    text[i] !== "\n"
  ) {
    i++;
  }
  if (text[i] !== "]") return null; // ran off the line unterminated
  if (text.slice(contentStart, i).trim() === "") return null; // whitespace-only content isn't a title
  return { length: i + 1 - pos, openLen: 1, closeLen: 1 };
}

export const wikiLinkRule: Rule = {
  nodeType: WikiLink,
  markType: WikiLinkMark,
  match: matchWikiLink,
};
