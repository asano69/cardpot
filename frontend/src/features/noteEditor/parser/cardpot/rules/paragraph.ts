import type { BlockContext, Line } from "@lezer/markdown";

import { countIndent, isBlankLine } from "../indent";

// Markdown's built-in Paragraph leaf block coalesces adjacent lines. Cardpot
// treats every source line as an outline row, so claim one non-blank line at a
// time and make its indentation an explicit syntax child.
export function parseParagraph(cx: BlockContext, line: Line): boolean {
  if (isBlankLine(line.text)) return false;

  const from = cx.lineStart;
  const indent = countIndent(line.text);
  const contentFrom = from + indent;
  const children = [
    ...(indent ? [cx.elt("Indent", from, contentFrom)] : []),
    ...cx.parser.parseInline(line.text.slice(indent), contentFrom),
  ];
  cx.addElement(cx.elt("Paragraph", from, from + line.text.length, children));
  cx.nextLine();
  return true;
}
