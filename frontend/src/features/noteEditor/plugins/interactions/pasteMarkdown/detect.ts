import {
  markdownSignals,
  scrapboxIgnoredRegions,
  scrapboxSignals,
} from "./rules";

// Removes the regions in which Scrapbox notation is only quoted, not used.
function withoutIgnoredRegions(text: string): string {
  return scrapboxIgnoredRegions.reduce(
    (rest, region) => rest.replace(region, ""),
    text,
  );
}

// Whether pasted text should be treated as Markdown. Pure: the rules live in
// rules.ts. A Scrapbox signal wins over any Markdown signal, but only outside
// code (see scrapboxIgnoredRegions).
export function looksLikeMarkdown(text: string): boolean {
  const outsideCode = withoutIgnoredRegions(text);
  if (scrapboxSignals.some((s) => s.pattern.test(outsideCode))) return false;
  return markdownSignals.some((s) => s.pattern.test(text));
}
