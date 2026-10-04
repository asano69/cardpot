// Ported from md2sb's compiler.ts (scrapbox-converter). A remark compiler
// plugin that turns an mdast tree into Scrapbox notation.
import type { Node, Parent } from "unist";
import addListItemCount from "./addListItemCount";
import generateCodeBlock from "./generateCodeBlock";

type Context = {
  parents: string[];
  listItemCount?: number;
  listDepth?: number;
};

// A heading is first written as this placeholder around its Markdown depth
// (e.g. "\uE0002\uE000"). Once the whole document is compiled, it is replaced
// by the real asterisks (see applyHeadingLevels).
const HEADING_PLACEHOLDER_RE = /\uE000(\d)\uE000/g;

class Compiler {
  lastElmEndLine: number;
  decorate: string[];
  // Markdown depths of the headings found in the document.
  headingDepths: Set<number>;

  constructor() {
    this.lastElmEndLine = 1;
    this.decorate = [];
    this.headingDepths = new Set();
  }

  isDecorateElement(node): boolean {
    return ["emphasis", "delete", "heading"].includes(
      typeof node === "string" ? node : node.type,
    );
  }

  // Gives the deepest heading in use "[** ]" and every shallower one a more
  // asterisk, so emphasis stays as small as possible. "[* ]" is left to
  // body text, so a heading never looks like plain bold.
  applyHeadingLevels(text: string): string {
    const depths = [...this.headingDepths].sort((a, b) => b - a);
    return text.replace(HEADING_PLACEHOLDER_RE, (_, depth: string) =>
      "*".repeat(2 + depths.indexOf(Number(depth))),
    );
  }

  compile(
    ast,
    _context: Omit<Context, "parents"> & { parents: string[] | undefined } = {
      parents: undefined,
    },
  ): string {
    let result = [...(ast.children || ast)]
      .map((node) =>
        this.node2SbText(node, {
          ..._context,
          parents: (_context.parents ?? []).slice(0),
        }),
      )
      .join("");
    if (
      ast.type &&
      ast.type === "root" &&
      result.charAt(result.length - 1) !== "\n"
    ) {
      result += "\n";
    }
    // Heading levels depend on the whole document, so they are resolved last.
    if (ast.type && ast.type === "root") {
      result = this.applyHeadingLevels(result);
    }
    return result;
  }

  node2SbText(node: Parent, context: Context): string {
    let result = "";
    if (context.parents.length === 0 && node.type !== "heading") {
      result += "\n".repeat(node.position.start.line - this.lastElmEndLine);
      this.lastElmEndLine = node.position.end.line;
    } else if (node.type === "listItem") {
      const lineBreak = Math.max(
        node.position.start.line - this.lastElmEndLine - 1,
        0,
      );
      result += "\n".repeat(lineBreak);
      this.lastElmEndLine = node.position.end.line;
    }
    context.parents.push(node.type);
    switch (node.type) {
      case "thematicBreak":
        result += "[/icons/hr.icon]";
        break;
      case "emphasis":
        this.decorate.push("/");
        result += this.compile(node.children, context);
        break;
      case "delete":
        this.decorate.push("-");
        result += this.compile(node.children, context);
        break;
      case "strong":
        result += `[[${this.compile(node.children, context)}]]`;
        break;
      case "heading":
        if (!("depth" in node)) break;
        this.headingDepths.add(node.depth as number);
        // The asterisks are filled in by applyHeadingLevels.
        this.decorate.push(`\uE000${node.depth}\uE000`);
        result += this.compile(node.children, context);
        break;
      case "link":
        if (!("url" in node)) break;
        if (
          (node.children as Node[]).filter((_) => _.type === "image").length
        ) {
          result += (node.children as Node[])
            .map((n) => {
              if (n.type === "image" && "url" in n)
                return `[${n.url} ${node.url}]`;
              return `[${this.compile(n, context)} ${node.url}]`;
            })
            .join("");
        } else {
          result += `[${this.compile(node.children, context)} ${node.url}]`;
        }
        break;
      case "image":
        if ("url" in node) result += `[${node.url}]`;
        break;
      case "inlineCode":
        if ("value" in node) result += `\`${node.value}\``;
        break;
      case "blockquote":
        {
          const depth = context.parents.filter(
            (p) => p === "blockquote",
          ).length;
          const quoteMark = "> ".repeat(Math.max(depth - 1, 1));
          result +=
            (depth === 1 ? "" : "\n") +
            quoteMark +
            this.compile(node.children, context)
              .split(/\n/)
              .join("\n" + quoteMark);
        }
        break;
      case "code":
        result += generateCodeBlock(node);
        break;
      case "table":
        result += "table:table\n";
        result +=
          " " +
          (node.children as Node[])
            .map((tableRow: Parent) =>
              (tableRow.children as Node[])
                .map((tableCell: Parent) => {
                  context.parents.push("tableCell");
                  return this.compile(tableCell.children, context);
                })
                .join("\t"),
            )
            .join("\n ");
        break;
      case "list":
        {
          const tagName = "ordered" in node && node.ordered ? "ol" : "ul";
          context.listItemCount = 0;
          context.parents[context.parents.length - 1] = tagName;
          result += this.compile(
            tagName === "ol" ? addListItemCount(node.children) : node.children,
            context,
          );
        }
        break;
      case "listItem": {
        const depth = context.parents.filter(
          (i) => i === "ol" || i === "ul",
        ).length;
        const isChangedDepth = 2 <= depth && (context.listDepth ?? 0) < depth;
        const inner = this.compile(node.children, {
          ...context,
          listDepth: depth,
        });
        result +=
          (isChangedDepth ? "\n" : "") +
          " ".repeat(depth) +
          ("listItemCount" in node && node.listItemCount
            ? node.listItemCount + ". "
            : "") +
          inner +
          (isChangedDepth ? "" : "\n");
        break;
      }
      case "paragraph":
        result += this.compile(node.children, context);
        break;
      case "text":
        {
          if (!("value" in node)) break;
          let textValue = node.value;
          if (context.parents.includes("tableCell"))
            textValue = (node.value as string).replace(/(\s|\t)+$/, "");
          if (context.parents.includes("listItem")) textValue = node.value;
          result += textValue;
        }
        break;
    }
    if (
      this.isDecorateElement(node) &&
      !context.parents.slice(0, -1).filter((_) => this.isDecorateElement(_))
        .length
    ) {
      result = `[${this.decorate.join("")} ${result}]`;
      if (node.type === "heading") {
        result =
          "\n".repeat(
            Math.max(node.position.start.line - this.lastElmEndLine, 0),
          ) + result;
        this.lastElmEndLine = node.position.end.line;
      }
      this.decorate = [];
    }
    return result;
  }
}

export function compiler(): void {
  const compile = new Compiler();
  this.Compiler = compile.compile.bind(compile);
}
