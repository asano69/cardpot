// Shared NodeProps and Rule/RuleMatch types used by every syntax rule
// in parser/cardpot (rules/bold.ts, rules/inlineCode.ts, ...). Kept in
// their own file, separate from index.ts, so a rule module can import
// these without creating a circular dependency with index.ts -- which
// in turn imports every rule module to assemble the `rules` array.
import { NodeProp } from "@lezer/common";

// Applied to a "container" node type (Bold, WikiLink, FencedCode, ...)
// to mark it as revealable: shown as styled text with its delimiter
// marks hidden, until the cursor touches it, at which point the raw
// markup is shown instead. The prop's value is the CSS class applied
// to the node's full range at all times (see syntaxReveal.ts).
export const revealStyle = new NodeProp<string>();

// Applied to a delimiter/mark node type (BoldMark, WikiLinkMark, ...)
// so syntaxReveal.ts can find and hide it generically, without
// knowing which specific syntax it belongs to. A mark node that
// should stay visible even when the cursor isn't touching it (e.g.
// FencedCodeMark's ``` fences) simply omits this prop.
export const isMark = new NodeProp<true>();
