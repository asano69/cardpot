import type { BlockContext, Line } from "@lezer/markdown";

import { countIndent } from "../indent";
import { consumeIndentedLines, startsIndentedBlock } from "./indentedBlock";

// A table's rows are indented relative to its `table:` declaration, and
// cells are separated by literal tab characters. Cell contents are parsed by
// Cardpot's normal inline parser, matching Scrapbox's table-node behavior.
export function parseTable(cx: BlockContext, line: Line): boolean {
  const indent = startsIndentedBlock(line, "table:");
  if (indent === null) return false;

  const from = cx.lineStart;
  let to = from + line.text.length;
  const children = [
    ...(indent ? [cx.elt("Indent", from, from + indent)] : []),
    cx.elt("TableMark", from + indent, to),
  ];

  consumeIndentedLines(cx, line, indent, (row, rowFrom) => {
    const rowIndent = countIndent(line.text);
    const rowChildren = [cx.elt("Indent", rowFrom - rowIndent, rowFrom)];
    let cellFrom = rowFrom;
    for (const cell of row.split("\t")) {
      const cellTo = cellFrom + cell.length;
      rowChildren.push(
        cx.elt(
          "TableCell",
          cellFrom,
          cellTo,
          cx.parser.parseInline(cell, cellFrom),
        ),
      );
      cellFrom = cellTo + 1;
    }
    const rowTo = rowFrom + row.length;
    children.push(cx.elt("TableRow", rowFrom - rowIndent, rowTo, rowChildren));
    to = rowTo;
  });

  cx.addElement(cx.elt("Table", from, to, children));
  return true;
}
