import { NodeType } from "@lezer/common";
import { revealStyle, isMark, type Rule, type RuleMatch } from "../nodeProps";

export const Code = NodeType.define({
  id: 3,
  name: "Code",
  props: [[revealStyle, "cm-inline-code"]],
});

export const CodeMark = NodeType.define({
  id: 4,
  name: "CodeMark",
  props: [[isMark, true]],
});

// An inline code span enclosed in a pair of backticks. The content
// may be empty and must not contain a backtick or a newline, so a
// code span never spans multiple lines.
function matchCode(text: string, pos: number): RuleMatch | null {
  if (text[pos] !== "`") return null;
  let i = pos + 1;
  while (i < text.length && text[i] !== "`" && text[i] !== "\n") {
    i++;
  }
  if (text[i] !== "`") return null; // ran off the line unterminated
  return { length: i + 1 - pos, openLen: 1, closeLen: 1 };
}

export const inlineCodeRule: Rule = {
  nodeType: Code,
  markType: CodeMark,
  match: matchCode,
};
