import { createMemo, createSignal, type Accessor } from "solid-js";
import { fetchRelatedCards } from "../api/cardApi";
import { readOwnLinks } from "../dexie/cardLinksCollection";
import { createLiveQuery } from "../dexie/liveQuery";
import type { CardRecord } from "../models/card";
import type { CardLinkRecord } from "../models/cardLink";
import type { ExtractedLink } from "../models/extractLinks";

// What the view needs of a link written in the open card. A CardLinkRecord
// fits it, so the replica's rows can be used as they are.
export type OwnLink = Pick<
  CardLinkRecord,
  "target_pot" | "target_title" | "target_titleLc"
>;

// The 1 hop / 2 hop rows are derived from the replica (see
// lib/dexie/relatedQuery.ts) and live in RelatedCards. This store only holds
// what cannot be derived there: the links of the open card as the editor
// reports them, and the cards matched by the card's saved datalog query.

// Links written in the open card's live text, tagged with the card they
// belong to. Undefined until the editor reports them (see setOwnLinks). The
// tag is what ties their lifetime to the card: a reader only accepts links of
// its own card (see createOwnLinks), so links left over from a card that was
// just closed can never show up under another card or a draft.
interface LiveOwnLinks {
  cardId: string;
  links: OwnLink[];
}

const [liveOwnLinks, setLiveOwnLinks] = createSignal<
  LiveOwnLinks | undefined
>();

// Cards matched by the datalog query saved in the open card. Loaded from the
// server, so it stays empty offline.
const [queryCards, setQueryCards] = createSignal<CardRecord[]>([]);

export { queryCards };

// The links of a card, in order of first appearance: the live text's links
// while the editor reports them for this very card, the replica's rows until
// then. Whether each link is alive is not decided here (see
// linkAliveStore.ts). Must be called inside a reactive owner, like
// createLiveQuery.
export function createOwnLinks(
  cardId: () => string | undefined,
): Accessor<OwnLink[]> {
  const replica = createLiveQuery(cardId, readOwnLinks, [] as CardLinkRecord[]);
  return createMemo(() => {
    const live = liveOwnLinks();
    return live && live.cardId === cardId() ? live.links : replica();
  });
}

// Replaces a card's links with the ones found in its live text. The editor of
// that card calls this while it is open; closeOwnLinks ends it.
export function setOwnLinks(
  cardId: string,
  pot: string,
  links: ExtractedLink[],
): void {
  setLiveOwnLinks({
    cardId,
    links: links.map((link) => ({
      target_pot: pot,
      target_title: link.title,
      target_titleLc: link.titleLc,
    })),
  });
}

// Called by a card's editor when it goes away. Only the owner's links are
// dropped, so a close that runs after the next card already reported its own
// links cannot erase them.
export function closeOwnLinks(cardId: string): void {
  if (liveOwnLinks()?.cardId === cardId) setLiveOwnLinks(undefined);
}

// Identifies the latest query load, so a slow response for a card that has
// since been replaced or closed is dropped.
let latest = 0;

// Loads the cards matched by the saved datalog query of a card. A failure
// (offline, or a bad query) is only logged and shows no row.
export async function openRelated(cardId: string): Promise<void> {
  const request = ++latest;
  try {
    const cards = await fetchRelatedCards(cardId);
    if (request !== latest) return;
    // Solid's setters treat undefined specially, so a missing list must
    // still end up as an empty array.
    setQueryCards(cards ?? []);
  } catch (err) {
    console.error("[related] failed to load query cards:", err);
    if (request === latest) setQueryCards([]);
  }
}

// Drops the query cards and ignores any load still in flight.
export function clearQuery(): void {
  latest++;
  setQueryCards([]);
}

// Forgets the query cards and the live links of whichever card owns them.
export function closeRelated(): void {
  clearQuery();
  setLiveOwnLinks(undefined);
}
