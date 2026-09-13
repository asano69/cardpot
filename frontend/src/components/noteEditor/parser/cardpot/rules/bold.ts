import { NodeType } from "@lezer/common";
import { revealStyle, isMark, type Rule, type RuleMatch } from "../nodeProps";

export const Bold = NodeType.define({
  id: 1,
  name: "Bold",
  props: [[revealStyle, "cm-bold"]],
});

export const BoldMark = NodeType.define({
  id: 2,
  name: "BoldMark",
  props: [[isMark, true]],
});

// "[* text]": an opening "[* " (bracket, asterisk, space), one or
// more characters that aren't "[", "]", or a newline, then a closing
// "]".
function matchBold(text: string, pos: number): RuleMatch | null {
  if (!text.startsWith("[* ", pos)) return null;
  let i = pos + 3;
  const contentStart = i;
  while (
    i < text.length &&
    text[i] !== "[" &&
    text[i] !== "]" &&
    text[i] !== "\n"
  ) {
    i++;
  }
  if (i === contentStart || text[i] !== "]") return null; // empty content, or ran off the line unterminated
  return { length: i + 1 - pos, openLen: 3, closeLen: 1 };
}

export const boldRule: Rule = {
  nodeType: Bold,
  markType: BoldMark,
  match: matchBold,
};
