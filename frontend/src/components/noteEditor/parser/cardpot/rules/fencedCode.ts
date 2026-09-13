import { NodeType } from "@lezer/common";
import { revealStyle, type Rule, type RuleMatch } from "../nodeProps";

// Styling only -- see editorTheme.ts's ".cm-code-block" rule.
export const FencedCode = NodeType.define({
  id: 7,
  name: "FencedCode",
  props: [[revealStyle, "cm-code-block"]],
});

// Unlike BoldMark/CodeMark/WikiLinkMark, this does NOT carry the
// `isMark` prop: a code block's opening/closing fences should stay
// visible at all times, so it's always clear where the block starts
// and ends, instead of only revealing them once the cursor moves
// inside (see syntaxReveal.ts, which hides only nodes tagged isMark).
export const FencedCodeMark = NodeType.define({
  id: 8,
  name: "FencedCodeMark",
});

// A closing fence line: "```" optionally followed by trailing
// horizontal whitespace, and nothing else.
const CLOSE_FENCE_RE = /^```[ \t]*$/;

// Matches a Markdown-style fenced code block: an opening line
// starting with "```" (optionally followed by a language tag, e.g.
// "```js" -- consumed as part of the opening fence, not used for
// syntax highlighting yet), then any number of lines, up to and
// including a line that is exactly "```" (trailing whitespace
// allowed). Unlike every other rule in this parser, this one is
// block-scoped: it deliberately spans multiple lines.
//
// The opening fence must start at the beginning of a line -- a
// "```" appearing mid-line (e.g. inside a sentence) is not a code
// block. An unterminated fence (no matching closing "```" anywhere in
// the rest of the document) does not match at all and is left as
// plain text, the same "give up rather than guess" behavior as inline
// Code.
function matchFencedCode(text: string, pos: number): RuleMatch | null {
  if (!text.startsWith("```", pos)) return null;
  if (pos > 0 && text[pos - 1] !== "\n") return null; // fence must start a line

  const firstLineEnd = text.indexOf("\n", pos);
  if (firstLineEnd === -1) return null; // no room for a closing fence on a later line
  const openLen = firstLineEnd + 1 - pos;

  let searchFrom = firstLineEnd + 1;
  while (searchFrom <= text.length) {
    const lineEnd = text.indexOf("\n", searchFrom);
    const lineText = text.slice(
      searchFrom,
      lineEnd === -1 ? text.length : lineEnd,
    );
    if (CLOSE_FENCE_RE.test(lineText)) {
      const to = searchFrom + lineText.length;
      return { length: to - pos, openLen, closeLen: lineText.length };
    }
    if (lineEnd === -1) return null; // reached end of document, never closed
    searchFrom = lineEnd + 1;
  }
  return null;
}

export const fencedCodeRule: Rule = {
  nodeType: FencedCode,
  markType: FencedCodeMark,
  match: matchFencedCode,
};
