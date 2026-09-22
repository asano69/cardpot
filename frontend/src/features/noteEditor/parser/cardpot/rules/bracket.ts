import type { InlineContext } from "@lezer/markdown";

// This is deliberately a structural dispatcher, modelled after cosy's
// parser/bracket.rs.  In particular, finding the matching bracket happens
// before deciding what its content means; adding another bracket notation
// therefore cannot change how nested brackets are paired.
export type BracketKind =
  | "Math"
  | "Icon"
  | "ProjectLink"
  | "GoogleMap"
  | "Image"
  | "ExternalLink"
  | "LinkedImage"
  | "WikiLink";

type UrlKind = "image" | "link";

export interface BracketDecision {
  kind: BracketKind;
  // For labelled links and linked images, the first and last tokens are the
  // only URL candidates, exactly as in cosy's links_and_pages.rs.
  href?: string;
  src?: string;
  label?: string;
}

const ICON_RE = /^.+\.icon(?:\*[1-9]\d*)?$/u;
const PROJECT_RE = /^\/[^/]+(?:\/.*)?$/u;
const COORDINATE_RE = /^[NS]\d+(?:\.\d+)?,[EW]\d+(?:\.\d+)?(?:,Z\d+)?$/u;
const GYAZO_RE =
  /^https?:\/\/(?:[0-9a-z-]+\.)?gyazo\.com\/[0-9a-f]{32}(?:\/raw)?$/iu;
// Tested against the whole URL, not just its path, so that Scrapbox's
// "append .png" trick (e.g. "...?q=abc&s=10.png" or "...#.png") works.
// The extension may only be followed by a query or fragment.
const IMAGE_EXTENSION_RE =
  /\.(?:avif|bmp|gif|ico|jpe?g|png|svg|tiff?|webp)(?:[?#].*)?$/iu;

function inferUrl(value: string): UrlKind | undefined {
  if (!value.includes("://") || !URL.canParse(value)) return undefined;
  const scheme = new URL(value).protocol; // "http:" | "https:" | "javascript:" ...
  if (scheme !== "http:" && scheme !== "https:") return undefined;
  return GYAZO_RE.test(value) || IMAGE_EXTENSION_RE.test(value)
    ? "image"
    : "link";
}
// Classifies the already-paired content of a single bracket. Keep this pure:
// it is the ambiguity boundary and is independently testable without Lezer.
export function decideBracketNodeType(content: string): BracketDecision {
  if (content.startsWith("$ ")) return { kind: "Math" };
  if (ICON_RE.test(content)) return { kind: "Icon" };
  if (PROJECT_RE.test(content)) return { kind: "ProjectLink" };

  const firstSpace = content.indexOf(" ");
  const first = firstSpace === -1 ? content : content.slice(0, firstSpace);
  const rest = firstSpace === -1 ? undefined : content.slice(firstSpace + 1);
  const lastSpace = content.lastIndexOf(" ");
  const last = lastSpace === -1 ? undefined : content.slice(lastSpace + 1);
  if (
    COORDINATE_RE.test(content) ||
    (first && COORDINATE_RE.test(first)) ||
    (last && COORDINATE_RE.test(last))
  ) {
    return { kind: "GoogleMap" };
  }

  const firstKind = inferUrl(first ?? "");
  if (last === undefined) {
    if (firstKind === "image") return { kind: "Image", src: first };
    if (firstKind === "link") return { kind: "ExternalLink", href: first };
    return { kind: "WikiLink" };
  }

  const lastKind = inferUrl(last);
  // A linked image requires exactly two URL tokens. For longer content,
  // `rest`/`start` are labels rather than URL candidates (cosy's rule).
  if (
    firstSpace === lastSpace &&
    firstKind &&
    lastKind &&
    (firstKind === "image" || lastKind === "image")
  ) {
    return firstKind === "image"
      ? { kind: "LinkedImage", src: first, href: last }
      : { kind: "LinkedImage", src: last, href: first };
  }
  if (firstKind === "link")
    return { kind: "ExternalLink", href: first, label: rest };
  if (lastKind)
    return {
      kind: "ExternalLink",
      href: last,
      label: content.slice(0, lastSpace),
    };
  return { kind: "WikiLink" };
}

function matchingBracket(cx: InlineContext, from: number): number {
  let depth = 0;
  for (let at = from; at < cx.end; at++) {
    const ch = cx.char(at);
    if (ch === 10) return -1;
    if (ch === 91) depth++;
    else if (ch === 93) {
      if (depth === 0) return at;
      depth--;
    }
  }
  return -1;
}

function marks(
  cx: InlineContext,
  node: string,
  from: number,
  to: number,
  children = [],
) {
  return cx.elt(node, from, to, [
    cx.elt(`${node}Mark`, from, from + 1),
    ...children,
    cx.elt(`${node}Mark`, to - 1, to),
  ]);
}

function parseSingleBracket(cx: InlineContext, pos: number): number {
  const end = matchingBracket(cx, pos + 1);
  if (end < 0) return -1;
  const contentFrom = pos + 1;
  const content = cx.slice(contentFrom, end);
  if (content === "") return -1;
  const decision = decideBracketNodeType(content);
  const to = end + 1;

  if (decision.kind === "WikiLink" || decision.kind === "ProjectLink") {
    return cx.addElement(marks(cx, decision.kind, pos, to));
  }
  if (
    decision.kind === "Math" ||
    decision.kind === "Icon" ||
    decision.kind === "GoogleMap" ||
    decision.kind === "Image" ||
    decision.kind === "LinkedImage"
  ) {
    return cx.addElement(cx.elt(decision.kind, pos, to));
  }
  const label = decision.label;
  const children =
    label === undefined
      ? []
      : cx.parser.parseInline(
          label,
          contentFrom +
            (content.startsWith(decision.href!)
              ? decision.href!.length + 1
              : 0),
        );
  return cx.addElement(marks(cx, "ExternalLink", pos, to, children));
}

function parseStrong(cx: InlineContext, pos: number): number {
  // Pair the inner `[` with nested-depth tracking, then require the outer ].
  const innerEnd = matchingBracket(cx, pos + 2);
  if (innerEnd < 0 || cx.char(innerEnd + 1) !== 93 || innerEnd === pos + 2)
    return -1;
  const contentFrom = pos + 2;
  const content = cx.slice(contentFrom, innerEnd);
  const kind = decideBracketNodeType(content).kind;
  const child =
    kind === "Image"
      ? "StrongImage"
      : kind === "Icon"
        ? "StrongIcon"
        : undefined;
  const children = child
    ? [cx.elt(child, contentFrom, innerEnd)]
    : cx.parser.parseInline(content, contentFrom);
  const to = innerEnd + 2;
  return cx.addElement(
    cx.elt("Strong", pos, to, [
      cx.elt("StrongMark", pos, contentFrom),
      ...children,
      cx.elt("StrongMark", innerEnd, to),
    ]),
  );
}

export function parseBracket(
  cx: InlineContext,
  next: number,
  pos: number,
): number {
  if (next !== 91) return -1;
  return cx.char(pos + 1) === 91
    ? parseStrong(cx, pos)
    : parseSingleBracket(cx, pos);
}
