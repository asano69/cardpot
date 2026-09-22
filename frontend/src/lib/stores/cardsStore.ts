import { createSignal } from "solid-js";
import { createStore, produce } from "solid-js/store";
import {
  deleteCard,
  fetchAllCards,
  subscribeToCards,
  updateCard,
  type CardEvent,
} from "../api/cardApi";
import type { CardRecord } from "../models/card";
import { titleToSlug } from "../models/slugify";
import { computePosition } from "../position";
import { withCardsFlip, registerCardElement } from "../cardFlip";

// Re-exported so CardItem only needs to import from this module
// (cardFlip.ts's registration map is an implementation detail of how
// cards get animated, not something callers need to know about).
export { registerCardElement };

// Global cache of every "cards" record seen so far, keyed by id. Pages
// that fetch cards (e.g. CardList) call mergeCards() to seed their
// results in here; startCardsSubscription() -- called once from
// AppShell -- then keeps the cache live via PocketBase's realtime API.
// Any page deriving its view from cardsById therefore reflects other
// users' edits, creates, and deletes without polling or its own
// subscription.
const [cardsById, setCardsById] = createStore<Record<string, CardRecord>>({});

export { cardsById };

// Resolves a card by its parent pot id and URL slug, scanning the
// already-loaded cardsById store instead of asking the server (see
// CardForm.tsx). A plain linear scan is cheap even for a few thousand
// cards, and it avoids the network round-trip the old server-side
// lookup (fetchCardBySlug) required on every card open. Cards no
// longer store their own slug (see lib/models/card.ts) -- it's
// derived from title on demand here, the same way titleToSegment
// derives a card's own edit link (see CardItem.tsx).
export function findCardByPotAndSlug(
  potId: string,
  slug: string,
): CardRecord | undefined {
  return Object.values(cardsById).find(
    (card) => card.pot === potId && titleToSlug(card.title) === slug,
  );
}

// Whether the initial full-collection fetch (see loadAllCards below)
// has completed. CardList gates its "Loading" spinner on this instead
// of tracking its own per-mount fetch, since the whole "cards"
// collection is loaded once for the app's lifetime now, not once per
// CardList mount.
const [cardsLoaded, setCardsLoaded] = createSignal(false);

export { cardsLoaded };

// Merges a freshly fetched batch of cards into the store. Existing
// entries for the same id are overwritten, so a stale cached copy
// never wins over a fresh fetch. By default this is wrapped in
// withCardsFlip so a reorder (e.g. another user's drag) animates every
// affected card into its new grid slot instead of snapping there
// instantly.
//
// `skipFlip` opts out of that animation. dnd-kit already animates the
// dragged card into place during the gesture itself, so replaying our
// own FLIP animation on top of that (when the local dragger's own
// optimistic update lands) makes the card jump/stutter instead of
// looking smooth -- see CardList's handleDragEnd, the only caller
// that passes this.
export function mergeCards(
  records: CardRecord[],
  options?: { skipFlip?: boolean },
) {
  const apply = () => {
    setCardsById(
      produce((store) => {
        for (const record of records) {
          store[record.id] = record;
        }
      }),
    );
  };

  if (options?.skipFlip) {
    apply();
  } else {
    withCardsFlip(apply);
  }
}

// Fetches every "cards" record once and merges it into the shared
// store. Called once from AppShell (see AppShell.tsx) instead of once
// per CardList mount: the "cards" collection carries no document body
// (that lives in the Yjs room -- see internal/serve/ydoc.go), so even
// a few thousand records is a small payload, small enough that
// loading it all upfront beats paginating it per pot per visit.
//
// Runs independently of startCardsSubscription below -- any realtime
// event that arrives while this fetch is still in flight is simply
// overwritten by this fetch's own mergeCards call once it resolves,
// since both write through the same last-write-wins store.
export async function loadAllCards(): Promise<void> {
  try {
    const records = await fetchAllCards();
    mergeCards(records, { skipFlip: true });
  } catch (err) {
    console.error("[cards] failed to load all cards:", err);
  } finally {
    setCardsLoaded(true);
  }
}

function deleteFromStore(id: string) {
  setCardsById(
    produce((store) => {
      delete store[id];
    }),
  );
}

// Applies one realtime event to the store. Wrapped in withCardsFlip so
// a position change from another user's drag animates smoothly into
// place instead of every card instantly snapping to its new grid slot.
function handleCardEvent(e: CardEvent) {
  withCardsFlip(() => {
    if (e.action === "delete") {
      deleteFromStore(e.record.id);
    } else {
      // Covers both "create" and "update": either way the latest
      // record replaces whatever this id currently holds.
      setCardsById(e.record.id, e.record);
    }
  });
}

// Starts the shared "cards" realtime subscription and returns an
// unsubscribe function. Meant to be called once, from an onCleanup at
// the app's root (see AppShell.tsx) -- not from individual pages,
// since every page reads from the same store regardless of who started
// the subscription.
export function startCardsSubscription(): () => void {
  let unsubscribe: (() => void) | undefined;
  let cancelled = false;

  subscribeToCards(handleCardEvent).then((unsub) => {
    // subscribe() is async, so the caller could have already
    // unsubscribed (e.g. fast HMR reload) by the time it resolves --
    // in that case, tear the subscription straight back down instead
    // of leaking it.
    if (cancelled) {
      unsub();
    } else {
      unsubscribe = unsub;
    }
  });

  return () => {
    cancelled = true;
    unsubscribe?.();
  };
}

// How long to wait, after the local optimistic reorder is applied,
// before sending the new position to PocketBase. This client is also
// subscribed to its own realtime "cards" updates (see
// startCardsSubscription above), and that handler always runs the FLIP
// animation, which sets the same element's `transform` that dnd-kit's
// own drop animation is still settling right after a drag ends.
// Delaying only the network request (not the local store update in
// moveCard) means the resulting echo arrives once dnd-kit's animation
// has long finished, so the FLIP handler measures identical
// before/after rects and animates nothing. Realtime propagation to
// other users isn't latency-sensitive enough for this brief delay to
// matter.
const PERSIST_DELAY_MS = 300;

// Moves `card` to `position` (see lib/position.ts).
//
// The new position is applied immediately, in step with dnd-kit's own
// drop animation settling the dragged card into this same slot.
// skipFlip: true since this is the local dragger's own move -- there's
// nothing left to FLIP-animate once dnd-kit has already shown the card
// moving there itself. Only the PocketBase round-trip (and the
// realtime echo it triggers) is deferred -- see PERSIST_DELAY_MS.
export function moveCard(card: CardRecord, position: number): void {
  const previousPosition = card.position;
  mergeCards([{ ...card, position }], { skipFlip: true });

  setTimeout(async () => {
    try {
      const updated = await updateCard(card.id, { position });
      mergeCards([updated], { skipFlip: true });
    } catch (err) {
      console.error("[cards] failed to reorder card:", err);
      mergeCards([{ ...card, position: previousPosition }], {
        skipFlip: true,
      });
    }
  }, PERSIST_DELAY_MS);
}

// Position for a card that is being pinned: half of the lowest
// existing pinned position in its pot, so it sorts first among the
// pinned cards (CardList sorts by descending position) without
// renumbering any of them.
function nextPinnedPosition(excludeId: string): number {
  const potId = cardsById[excludeId]?.pot;
  const positions = Object.values(cardsById)
    .filter((card) => card.pot === potId && card.pin && card.id !== excludeId)
    .map((card) => card.position);
  return computePosition(
    undefined,
    positions.length ? Math.min(...positions) : undefined,
  );
}

// Pins or unpins a card. Pinning also gives it a fresh position on the
// pinned scale (see nextPinnedPosition). Rejects on failure, leaving
// the store unchanged.
export async function setCardPinned(
  id: string,
  pinned: boolean,
): Promise<void> {
  const changes = pinned
    ? { pin: true, position: nextPinnedPosition(id) }
    : { pin: false };
  mergeCards([await updateCard(id, changes)]);
}

// Deletes a card and drops it from the store right away, instead of
// waiting for the realtime "delete" echo.
export async function removeCard(id: string): Promise<void> {
  await deleteCard(id);
  withCardsFlip(() => deleteFromStore(id));
}
