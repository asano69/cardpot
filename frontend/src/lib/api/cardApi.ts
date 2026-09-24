import { ClientResponseError } from "pocketbase";
import pb from "./pb";
import type { CardRecord, TitleCandidate } from "../models/card";
import { titleToSlug } from "../models/slugify";

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
  return await pb.send<CardMutationResult>("/api/admin/cards", {
    method: "POST",
    body: { pot, titleCandidate },
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
  return await pb.send<CardMutationResult>(`/api/admin/cards/${cardId}/title`, {
    method: "POST",
    body: { titleCandidate },
  });
}

// Sort order
// Sort order for every windowed card listing: pinned cards first,
// then descending position, with id as a tiebreak for equal
// positions. Mirrors CardList.tsx's own client-side sort from the
// full-fetch era, so paging through this produces the same order the
// grid used to show.
const CARDS_SORT = "-pin,-position,id";

export interface CardsPage {
  items: CardRecord[];
  totalItems: number;
}

// Fetches one page of a pot's cards via PocketBase's built-in list
// pagination -- no custom backend route needed, since filter + sort +
// page/perPage + totalItems are all standard `getList` features.
//
// requestKey: null opts out of the SDK's auto-cancellation, which
// aborts an in-flight request whenever another one with the same
// method and path starts -- here that would let a page load and a
// slug lookup (or two quick page loads) cancel each other.
export async function fetchCardsPage(
  potId: string,
  page: number,
  perPage: number,
): Promise<CardsPage> {
  const result = await pb
    .collection("cards")
    .getList<CardRecord>(page, perPage, {
      filter: pb.filter("pot = {:pot}", { pot: potId }),
      sort: CARDS_SORT,
      requestKey: null,
    });
  return { items: result.items, totalItems: result.totalItems };
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
    record = await pb
      .collection("cards")
      .getFirstListItem<CardRecord>(
        pb.filter("pot = {:pot} && titleLc = {:titleLc}", {
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

// Updates a card's own fields directly. The title is deliberately not
// in this list: it only ever changes via updateCardTitle above.
export async function updateCard(
  id: string,
  changes: Partial<Pick<CardRecord, "pin" | "position">>,
): Promise<CardRecord> {
  return await pb.collection("cards").update<CardRecord>(id, changes);
}

export async function deleteCard(id: string): Promise<void> {
  await pb.collection("cards").delete(id);
}

// One realtime change to a "cards" record, as published by the server
// (see internal/realtime) and delivered by lib/api/realtime.ts. `action`
// is "create", "update" or "delete".
export interface CardEvent {
  action: string;
  record: CardRecord;
}
