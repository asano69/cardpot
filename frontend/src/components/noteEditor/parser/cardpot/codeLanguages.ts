// Dynamic, per-language syntax highlighting for fenced code blocks
// (see rules/fencedCode.ts). Mirrors @codemirror/lang-markdown's own
// getCodeParser: language grammars are not bundled up front -- the
// info string after the opening "```" (e.g. "```ts") is looked up in
// @codemirror/language-data's catalog, and the matching parser
// package is only pulled in via a dynamic import() the first time
// that language is actually used. Until the import resolves, the
// block is parsed with ParseContext.getSkippingParser, which yields
// no tree for the content (so it renders as plain text) and schedules
// a reparse once the language finishes loading.
import type { Input, SyntaxNodeRef } from "@lezer/common";
import { parseMixed } from "@lezer/common";
import { LanguageDescription, ParseContext } from "@codemirror/language";
import { languages } from "@codemirror/language-data";

// Strips the opening fence itself so the trailing text is just the
// language info (e.g. "```ts" -> "ts"). Only backticks are matched,
// mirroring fencedCode.ts's own fence detection ("~~~" fences aren't
// used by this app's parser).
const FENCE_MARK_RE = /^`+/;

// Reads a FencedCode node's opening-fence line and returns its info
// string (the text after the backticks, trimmed), or "" if there is
// none.
function readInfo(node: SyntaxNodeRef, input: Input): string {
  const openMark = node.node.firstChild;
  if (!openMark) return "";
  const line = input.read(openMark.from, openMark.to);
  return line.replace(FENCE_MARK_RE, "").trim();
}

// A FencedCode node's only children are its two FencedCodeMark nodes
// (the opening and closing fence -- see fencedCode.ts); the actual
// code text is simply whatever lies between them. Returns that gap,
// so the fence markup itself is excluded from the nested parse.
function codeRange(node: SyntaxNodeRef) {
  const open = node.node.firstChild;
  const close = node.node.lastChild;
  if (!open || !close || open === close) return null;
  return { from: open.to, to: close.from };
}

// Looks up `info` in @codemirror/language-data's catalog and returns
// a nested-parse descriptor for it, or null if no language matches or
// the block has no code content to nest into.
function nestFencedCode(node: SyntaxNodeRef, input: Input) {
  if (node.name !== "FencedCode") return null;

  const range = codeRange(node);
  if (!range) return null;

  const info = readInfo(node, input);
  if (!info) return null;

  const found = LanguageDescription.matchLanguageName(languages, info, true);
  if (!(found instanceof LanguageDescription)) return null;

  // Already loaded (e.g. an earlier code block used the same
  // language this session): parse with it directly.
  if (found.support) {
    return { parser: found.support.language.parser, overlay: [range] };
  }

  // Not loaded yet: kick off the dynamic import and, in the
  // meantime, parse this block with a parser that produces no tree.
  // ParseContext reparses the document once found.load() resolves,
  // at which point found.support is set and the branch above takes
  // over.
  return {
    parser: ParseContext.getSkippingParser(found.load()),
    overlay: [range],
  };
}

export const codeLanguageWrap = parseMixed(nestFencedCode);
