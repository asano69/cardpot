// The tunable rules of the Markdown paste conversion: add, remove or edit an
// entry to change what is detected. Signal patterns must not use the g flag
// (they are reused with test()).
export interface Signal {
  name: string;
  pattern: RegExp;
}

// Notation that only Scrapbox uses. Any match vetoes the conversion, because
// converting Scrapbox text would corrupt it, while skipping Markdown only
// leaves the text as it was.
export const scrapboxSignals: Signal[] = [
  // "[* x]", "[/ x]", "[*/ x]", "[- x]"
  { name: "decoration", pattern: /\[[*/-]+ / },
  // "code:name" / "table:name" blocks
  { name: "block", pattern: /^[ \t\u3000]*(code|table):/m },
  // "[[x]]"
  { name: "strong", pattern: /\[\[[^\]\n]+\]\]/ },
  // "#tag"; "# x" and "## x" are Markdown headings, not tags
  { name: "hashtag", pattern: /(^|\s)#[^#\s]/m },
];

// Regions removed before the Scrapbox signals are checked, so notation quoted
// as code (e.g. a Markdown document explaining "`[- text]`") does not veto the
// conversion. These patterns need the g flag (they are used with replace()),
// and are applied in order: fenced blocks first, then inline code spans.
export const scrapboxIgnoredRegions: RegExp[] = [
  // A fenced block, up to its closing fence
  /^(```|~~~)[^\n]*\n[\s\S]*?^\1[ \t]*$/gm,
  // An inline code span (never spans lines, like the parser's Code node)
  /`[^`\n]*`/g,
];

// Notation that only Markdown uses. Any match (without a veto) converts.
export const markdownSignals: Signal[] = [
  { name: "heading", pattern: /^#{1,6} \S/m },
  { name: "link or image", pattern: /!?\[[^\]\n]+\]\([^)\n]+\)/ },
  { name: "fenced code", pattern: /^(```|~~~)/m },
  { name: "bold", pattern: /\*\*[^*\n]+\*\*/ },
  { name: "strikethrough", pattern: /~~[^~\n]+~~/ },
  // A header row followed by a delimiter row such as "|---|:-:|"
  {
    name: "table",
    pattern: /^\|.*\|[ \t]*\n\|?[ \t:|-]*-[ \t:|-]*$/m,
  },
  { name: "horizontal rule", pattern: /^(-{3,}|\*{3,}|_{3,})[ \t]*$/m },
  // Weak signal: a single "- x" line is too common, so two in a row are needed.
  { name: "list", pattern: /^([-*+]|\d+\.) .*\n([-*+]|\d+\.) /m },
];
