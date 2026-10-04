import { createStore } from "solid-js/store";
import {
  fetchLinks1Hop,
  fetchLinks2Hop,
  fetchRelatedCards,
} from "../api/cardApi";
import type { Link2HopCard, LinkedCard } from "../api/generated";
import { readOwnLinks } from "../dexie/cardLinksCollection";
import type { CardRecord } from "../models/card";
import type { ExtractedLink } from "../models/extractLinks";
import type { CardLinkRecord } from "../models/cardLink";

// What the view needs of a link written in the open card. A CardLinkRecord
// fits it, so the replica's rows can be used as they are.
export type OwnLink = Pick<
  CardLinkRecord,
  "target_pot" | "target_title" | "target_titleLc"
>;

// The related cards of the one card that is currently open. They live here
// and not in cardsStore's cardsById: that store only holds the page windows
// and the cards opened by URL, and its release/realtime rules assume it. Cards
// from a link view would be window-less strays there.
//
// Everything is kept as records with an id, in the order the server returns
// them (title order for 1 hop, link order for 2 hop), so the arrays are not
// turned into id maps. A 2-hop row keeps its via_title/via_titleLc;
// grouping rows by target is left to the view (see RelatedCards).
interface RelatedState {
  oneHop: LinkedCard[];
  twoHop: Link2HopCard[];
  // Cards matched by the datalog query saved in the open card.
  query: CardRecord[];
  // Links written in the open card, in order of first appearance. They come
  // from the local replica until the editor starts reporting the live text
  // (see setOwnLinks). Whether each is alive is not decided here (see
  // linkAliveStore.ts).
  ownLinks: OwnLink[];
  // Whether the last load failed (a bad query counts as a failure).
  error: boolean;
  // Whether a load has succeeded since the store was last emptied. Tells
  // "not loaded yet" apart from "loaded, and there are no related cards".
  loaded: boolean;
}

function emptyState(): RelatedState {
  return {
    oneHop: [],
    twoHop: [],
    query: [],
    ownLinks: [],
    error: false,
    loaded: false,
  };
}

const [related, setRelated] = createStore<RelatedState>(emptyState());

export { related };

// Identifies the latest load, so a slow response for a card that has since
// been replaced or closed is dropped instead of overwriting the newer state.
let latest = 0;

// Whether the editor has reported the open card's links (see setOwnLinks).
// From then on the live text is the source of truth, so a load must not
// overwrite ownLinks with the replica's older rows.
let ownLinksLive = false;

// Loads the related cards of the card titled `title` into the store. The
// previous cards stay visible until the new ones arrive. `cardId` is omitted
// for a draft: it has no record, so it has no datalog query, but its title can
// still have incoming links.
export async function openRelated(
  potSlug: string,
  title: string,
  cardId?: string,
): Promise<void> {
  const request = ++latest;
  try {
    const [oneHop, twoHop, query, ownLinks] = await Promise.all([
      fetchLinks1Hop(potSlug, title),
      fetchLinks2Hop(potSlug, title),
      cardId ? fetchRelatedCards(cardId) : Promise.resolve<CardRecord[]>([]),
      cardId ? readOwnLinks(cardId) : Promise.resolve<CardLinkRecord[]>([]),
    ]);
    if (request !== latest) return;
    // Solid's store deletes a property set to undefined, so a response
    // without a list must still end up as an empty array here.
    setRelated({
      oneHop: oneHop ?? [],
      twoHop: twoHop ?? [],
      query: query ?? [],
      error: false,
      loaded: true,
    });
    if (!ownLinksLive) setRelated("ownLinks", ownLinks ?? []);
  } catch (err) {
    console.error("[related] failed to load related cards:", err);
    if (request !== latest) return;
    setRelated("error", true);
  }
}

// Replaces the open card's links with the ones found in its live text. The
// editor calls this while the card is open; closeRelated ends it.
export function setOwnLinks(pot: string, links: ExtractedLink[]): void {
  ownLinksLive = true;
  setRelated(
    "ownLinks",
    links.map((link) => ({
      target_pot: pot,
      target_title: link.title,
      target_titleLc: link.titleLc,
    })),
  );
}

// Drops every related card and ignores any load still in flight. Called when
// the open card is closed.
export function closeRelated(): void {
  latest++;
  ownLinksLive = false;
  setRelated(emptyState());
}
