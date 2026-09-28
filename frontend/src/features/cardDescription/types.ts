// One piece of a card description, ready to be rendered. "text" is
// unmarked text; every other kind gets its own tag and "grid-<kind>"
// class (see styles/components.css).
export type DescriptionSegmentKind =
  "text" | "wikilink" | "external-link" | "hashtag" | "inline-code";

export interface DescriptionSegment {
  kind: DescriptionSegmentKind;
  text: string;
}
