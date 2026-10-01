import { ClientResponseError } from "pocketbase";
import pb from "./pb";
import type { CardRecord, TitleCandidate } from "../models/card";
import type {
  CreateCardRequest,
  LinkedCard,
  Link2HopCard,
  UpdateCardTitleRequest,
} from "./generated";
import { titleToSegment, titleToSlug } from "../models/slugify";

// Response shape shared by createCard/updateCardTitle: the saved card,
// plus a merge-alert target computed server-side (see findMergeTarget
// in internal/serve/slug.go) -- the title of another card in the same
// pot whose header this one's header appears to duplicate, or null.
export interface CardMutationResult {
  card: CardRecord;
  mergeTarget: string | null;
}

// Creates a new "cards" record with a title resolved server-side from
// `titleCandidate` (see internal/serve/cards.go's createCardHandler).
// Used by NoteEditor's draft mode, which needs a real record id before
// Yjs sync can start.
export async function createCard(
  pot: string,
  titleCandidate: TitleCandidate,
): Promise<CardMutationResult> {
  const body: CreateCardRequest = { pot, titleCandidate };
  return await pb.send<CardMutationResult>("/api/admin/cards", {
    method: "POST",
    body,
  });
}

// Resolves and saves a new title for an existing card (see
// internal/serve/cards.go's updateCardTitleHandler). The card's URL
// segment is derived from this same title on demand (see
// lib/slugify.ts) instead of being a separate field kept in sync here.
// Resolving a card by its URL slug now happens entirely client-side
// against the already-loaded cardsById store (see
// lib/stores/cardsStore.ts's findCardByPotAndSlug) instead of a dedicated
// server route -- there is no per-open network round-trip anymore.
export async function updateCardTitle(
  cardId: string,
  titleCandidate: TitleCandidate,
): Promise<CardMutationResult> {
  const body: UpdateCardTitleRequest = { titleCandidate };
  return await pb.send<CardMutationResult>(`/api/admin/cards/${cardId}/title`, {
    method: "POST",
    body,
  });
}

// Resolves a single card by its URL slug, without fetching the rest
// of the pot -- replaces the old approach of scanning every already-
// loaded card with titleToSlug (see cardsStore.ts's
// findCardByPotAndSlug).
//
// titleLc (see internal/slug.ToLowerKey) is a fast, indexed candidate
// lookup: lowercase, spaces mapped to underscores. It is not
// injective ("a b" and "a_b" share a titleLc), so the single match it
// returns is re-verified against titleToSlug(title) -- the real slug
// comparison -- before being trusted. Returns undefined when no card
// matches, whether because titleLc found nothing or because the
// verification failed. Any other failure (network, auth, ...) is
// rethrown, so a caller never mistakes it for "no such card".
export async function fetchCardBySlug(
  potId: string,
  slug: string,
): Promise<CardRecord | undefined> {
  const candidateTitleLc = slug.toLowerCase();
  let record: CardRecord;
  try {
    record = await pb.collection("cards").getFirstListItem<CardRecord>(
      pb.filter('pot = {:pot} && titleLc = {:titleLc} && deleted = ""', {
        pot: potId,
        titleLc: candidateTitleLc,
      }),
      { requestKey: null },
    );
  } catch (err) {
    if (err instanceof ClientResponseError && err.status === 404) {
      return undefined;
    }
    throw err;
  }
  return titleToSlug(record.title) === slug ? record : undefined;
}

// Fetches the cards matched by the datalog query saved in a card's "query"
// field (see internal/serve/links_datalog.go's cardQueryHandler). Rejects
// with the server's message when the query is invalid. requestKey: null
// keeps a refetch from auto-cancelling an earlier in-flight request.
export async function fetchRelatedCards(cardId: string): Promise<CardRecord[]> {
  const res = await pb.send<{ cards: CardRecord[] }>(
    `/api/admin/cards/${cardId}/related`,
    { method: "GET", requestKey: null },
  );
  return res.cards;
}

// Shared by
// Shared by the two hop fetchers below (see internal/serve/links.go). The pot
// is addressed by its name and the card by the slug derived from its title.
async function fetchHop<T>(
  potName: string,
  title: string,
  key: "links1hop" | "links2hop",
): Promise<T> {
  const res = await pb.send<Record<string, T>>(
    `/api/pages/${potName}/${titleToSegment(title)}/${key}`,
    { method: "GET", requestKey: null },
  );
  return res[key];
}

// Fetches the live cards one wiki-link hop away from the card titled `title`.
export function fetchLinks1Hop(
  potName: string,
  title: string,
): Promise<LinkedCard[]> {
  return fetchHop<LinkedCard[]>(potName, title, "links1hop");
}

// Fetches the cards two hops away: one row per (shared target, card), rows of
// the same target adjacent (see RelatedCards, which groups them).
export function fetchLinks2Hop(
  potName: string,
  title: string,
): Promise<Link2HopCard[]> {
  return fetchHop<Link2HopCard[]>(potName, title, "links2hop");
}

// Updates a card's own fields directly. The title is deliberately not
// in this list: it only ever changes via updateCardTitle above.
export async function updateCard(
  id: string,
  changes: Partial<Pick<CardRecord, "pin" | "position" | "deleted" | "query">>,
): Promise<CardRecord> {
  return await pb.collection("cards").update<CardRecord>(id, changes);
}

// Soft-deletes a card by stamping its "deleted" date; the record itself
// stays in the database. The realtime "update" event this produces is
// what makes other clients drop the card (see cardsStore.ts).
export async function deleteCard(id: string): Promise<void> {
  await updateCard(id, { deleted: new Date().toISOString() });
}
