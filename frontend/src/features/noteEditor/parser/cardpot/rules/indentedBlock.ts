import type { BlockContext, Line } from "@lezer/markdown";

// Cardpot uses tabs for structural indentation (as do bulletEnter.ts and
// hangingIndent.ts). A child line belongs to an indented block only when it
// has more leading tabs than the block's prefix line.
export function countLeadingTabs(text: string): number {
  let indent = 0;
  while (text[indent] === "\t") indent++;
  return indent;
}

export function startsIndentedBlock(line: Line, prefix: string): number | null {
  const indent = countLeadingTabs(line.text);
  return line.text.slice(indent).startsWith(prefix) ? indent : null;
}

// Consumes every immediately following line whose tab indentation is deeper
// than `indent`. The terminating line deliberately remains current so the
// markdown block pipeline can dispatch it as the next Cardpot block.
export function consumeIndentedLines(
  cx: BlockContext,
  line: Line,
  indent: number,
  consume: (text: string, from: number) => void,
): void {
  while (cx.nextLine()) {
    if (countLeadingTabs(line.text) <= indent) return;
    consume(line.text.slice(indent + 1), cx.lineStart + indent + 1);
  }
}
