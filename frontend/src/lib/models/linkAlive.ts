import type { LinkedCard } from "../api/generated";
import type { CardLinkRecord } from "./cardLink";

// A wiki link is alive when its target card exists or when some other card
// links to the same target; otherwise opening it would start an empty draft
// with no related cards.
//
// `cards` is every related card of the open card (1 hop and 2 hop). A card
// that shares the target is always in one of the two lists, so the 2-hop
// de-duplication does not matter here. `ownTitleLc` lets a link to the open
// card itself count as alive, since the related lists never contain it.
export function isLinkAlive(
  titleLc: string,
  cards: readonly Pick<LinkedCard, "titleLc" | "target_titleLc">[],
  ownTitleLc: string,
): boolean {
  if (titleLc === ownTitleLc) return true;
  return cards.some(
    (card) => card.titleLc === titleLc || card.target_titleLc.includes(titleLc),
  );
}

// The links of the open card whose target is not alive (see isLinkAlive),
// in their original order. Shown as "New Links" next to the related cards.
export function deadLinks(
  links: readonly CardLinkRecord[],
  cards: readonly Pick<LinkedCard, "titleLc" | "target_titleLc">[],
  ownTitleLc: string,
): CardLinkRecord[] {
  return links.filter(
    (link) => !isLinkAlive(link.target_titleLc, cards, ownTitleLc),
  );
}
