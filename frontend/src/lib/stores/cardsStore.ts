import { createStore, produce } from "solid-js/store";
import {
  deleteCard,
  fetchCardBySlug,
  fetchCardsPage,
  updateCard,
  type CardEvent,
} from "../api/cardApi";
import { subscribeToCards } from "../api/realtime";
import type { CardRecord } from "../models/card";
import { computePosition } from "../position";
import { withCardsFlip, registerCardElement } from "../cardFlip";
import {
  deleteFromCache,
  forgetCache,
  readCache,
  writeCache,
} from "../signaldb/cardsCollection";

// Re-exported so CardItem only needs to import from this module
// (cardFlip.ts's registration map is an implementation detail of how
// cards get animated, not something callers need to know about).
export { registerCardElement };

// How many cards one page request loads.
const PAGE_SIZE = 100;

// Cache of the cards the UI currently needs: every card of a loaded
// pot window (see below) plus any card opened by URL. A pot can hold
// ~100k cards, so this is deliberately NOT the whole collection.
// watchCards() keeps these entries live via the shared cards channel;
// events for cards not held here are ignored.
const [cardsById, setCardsById] = createStore<Record<string, CardRecord>>({});

export { cardsById };

// The part of one pot's card list loaded so far. `ids` are in load
// order only -- callers sort what they display (see CardList), since a
// realtime or local change can reorder cards inside the window.
export interface PotWindow {
  ids: string[];
  // Server-reported number of cards in the pot (all pages).
  total: number;
  // Whether the first page request has settled, successfully or not.
  loaded: boolean;
  loading: boolean;
}

const [windows, setWindows] = createStore<Record<string, PotWindow>>({});

// Reactive when called inside a tracking scope.
export function potWindow(potId: string | undefined): PotWindow | undefined {
  return potId ? windows[potId] : undefined;
}

// Merges a batch of cards into the store. Existing entries for the same
// id are overwritten, so a stale cached copy never wins over a fresh
// fetch. By default this is wrapped in withCardsFlip so a reorder (e.g.
// another user's drag) animates every affected card into its new grid
// slot instead of snapping there instantly.
//
// `skipFlip` opts out of that animation. dnd-kit already animates the
// dragged card into place during the gesture itself, so replaying our
// own FLIP animation on top of that (when the local dragger's own
// optimistic update lands) makes the card jump/stutter instead of
// looking smooth -- see moveCard below.
//
// Every merge also write-throughs into each record's own pot's
// IndexedDB cache (see lib/signaldb/cardsCollection.ts), fire-and-
// forget, so the pot repaints instantly next time it's opened --
// most importantly while offline. The UI itself never reads from
// that cache.
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

  const byPot = new Map<string, CardRecord[]>();
  for (const record of records) {
    const list = byPot.get(record.pot) ?? [];
    list.push(record);
    byPot.set(record.pot, list);
  }
  for (const [potId, list] of byPot) writeCache(potId, list);
}

// Loads the next page of a pot's card list (the first page when nothing
// is loaded yet) and appends it to that pot's window. A no-op while a
// request is in flight or once every card is loaded. A failure is only
// logged and leaves the window as it was.
//
// The page requested is the one containing the window's end, not "the
// last page + 1": after a card inside the window is deleted, the
// server's list shifts up by one, and asking for the following page
// would skip the card that slid into the gap. The overlap this causes
// is harmless because ids already in the window are ignored.
export async function loadNextCardsPage(potId: string): Promise<void> {
  if (!windows[potId]) {
    setWindows(potId, { ids: [], total: 0, loaded: false, loading: false });

    // Instant paint from whatever this pot's IndexedDB cache still
    // holds from a previous visit, before the network request below
    // even starts -- this is what makes an already-visited pot show
    // something immediately while offline.
    const cached = await readCache(potId);
    if (!windows[potId]) return; // pot was released while the cache read was in flight
    if (cached.length) {
      mergeCards(cached, { skipFlip: true });
      setWindows(
        potId,
        produce((w) => {
          const seen = new Set(w.ids);
          for (const card of cached) {
            if (!seen.has(card.id)) w.ids.push(card.id);
          }
        }),
      );
    }
  }
  const win = windows[potId];
  if (win.loading || (win.loaded && win.ids.length >= win.total)) return;

  setWindows(potId, "loading", true);
  let result: Awaited<ReturnType<typeof fetchCardsPage>> | undefined;
  try {
    const page = Math.floor(win.ids.length / PAGE_SIZE) + 1;
    result = await fetchCardsPage(potId, page, PAGE_SIZE);
  } catch (err) {
    console.error("[cards] failed to load cards page:", err);
  }

  // The user may have left the pot while the request was in flight.
  if (!windows[potId]) return;

  if (result) {
    const items = result.items;
    mergeCards(items, { skipFlip: true });
    setWindows(
      potId,
      produce((w) => {
        const seen = new Set(w.ids);
        let added = 0;
        for (const card of items) {
          if (!seen.has(card.id)) {
            w.ids.push(card.id);
            added++;
          }
        }
        // A page that adds nothing new means the server's list no
        // longer lines up with the window (e.g. cards were reordered
        // elsewhere). Treat the window as complete so scrolling cannot
        // request the same page forever; a reload fixes it.
        w.total = added === 0 ? w.ids.length : result.totalItems;
      }),
    );
  }
  setWindows(potId, { loaded: true, loading: false });
}

// Fetches one card by its URL slug straight from the server and puts
// it into the store, so realtime updates keep the open card live.
// Resolves to undefined when the pot has no such card.
export async function openCardBySlug(
  potId: string,
  slug: string,
): Promise<CardRecord | undefined> {
  const record = await fetchCardBySlug(potId, slug);
  if (record) mergeCards([record], { skipFlip: true });
  return record;
}

// Forgets a pot's window and every card of that pot the store holds
// (window cards and any card opened by URL), so the store only holds
// what the user is looking at. Called when the user leaves the pot
// (see PotLayout). The pot's IndexedDB cache itself is left alone
// (see forgetCache), so it's still there to hydrate from next visit.
export function releasePot(potId: string) {
  setWindows(
    produce((all) => {
      delete all[potId];
    }),
  );
  setCardsById(
    produce((store) => {
      for (const id of Object.keys(store)) {
        if (store[id].pot === potId) delete store[id];
      }
    }),
  );
  forgetCache(potId);
}

// Removes a card from the store and, when its pot has a loaded window,
// from that window too. The count only drops if the card was in the
// window, so a repeated delete cannot double-count.
function dropCard(id: string, potId: string | undefined) {
  if (potId && windows[potId]) {
    setWindows(
      potId,
      produce((w) => {
        const index = w.ids.indexOf(id);
        if (index >= 0) {
          w.ids.splice(index, 1);
          w.total -= 1;
        }
      }),
    );
  }
  setCardsById(
    produce((store) => {
      delete store[id];
    }),
  );
  if (potId) deleteFromCache(potId, id);
}

// A created card only matters here if its pot's window is loaded;
// otherwise the next page load will bring it in from the server.
function addCreatedCard(record: CardRecord) {
  if (!windows[record.pot]?.loaded) return;
  setCardsById(record.id, record);
  writeCache(record.pot, [record]);
  setWindows(
    record.pot,
    produce((w) => {
      if (!w.ids.includes(record.id)) {
        w.ids.push(record.id);
        w.total += 1;
      }
    }),
  );
}

// Applies one realtime event to the store. Wrapped in withCardsFlip so
// a position change from another user's drag animates smoothly into
// place instead of every card instantly snapping to its new grid slot.
function handleCardEvent(e: CardEvent) {
  withCardsFlip(() => {
    // A soft-deleted card leaves the store like a removed one, whichever
    // action reports it (deleting sends an "update" carrying `deleted`).
    if (e.action === "delete" || e.record.deleted) {
      dropCard(e.record.id, e.record.pot);
    } else if (e.action === "create") {
      addCreatedCard(e.record);
    } else if (cardsById[e.record.id]) {
      // An update for a card we don't hold is ignored, so the store
      // never grows beyond what the UI actually loaded.
      setCardsById(e.record.id, e.record);
      writeCache(e.record.pot, [e.record]);
    }
  });
}

// Reloads the part of a pot's card list the window currently covers, for
// when realtime events may have been missed and could not be replayed (see
// subscribeToCards). Cards that no longer exist are dropped. Pages are
// fetched one after another, so a large window takes several requests --
// acceptable for a rare recovery.
//
// A page load still in flight while this runs may append a page fetched
// before the resync; ids already in the window are ignored, so at worst
// that page is slightly stale.
export async function resyncPot(potId: string): Promise<void> {
  const win = windows[potId];
  // Nothing loaded yet: the first page load fetches fresh data anyway.
  if (!win?.loaded) return;

  const pages = Math.max(1, Math.ceil(win.ids.length / PAGE_SIZE));
  const items: CardRecord[] = [];
  let total = 0;
  try {
    for (let page = 1; page <= pages; page++) {
      const result = await fetchCardsPage(potId, page, PAGE_SIZE);
      items.push(...result.items);
      total = result.totalItems;
    }
  } catch (err) {
    console.error("[cards] failed to resync pot:", err);
    return;
  }

  // The user may have left the pot while the requests were in flight.
  if (!windows[potId]) return;

  const fresh = new Set(items.map((card) => card.id));
  const vanished = windows[potId].ids.filter((id) => !fresh.has(id));
  mergeCards(items, { skipFlip: true });
  setWindows(
    potId,
    produce((w) => {
      w.ids = [...fresh];
      w.total = total;
    }),
  );
  setCardsById(
    produce((store) => {
      for (const id of vanished) delete store[id];
    }),
  );
  for (const id of vanished) deleteFromCache(potId, id);
}

// Keeps every loaded pot window live through the shared cards channel and
// returns a function that stops watching. Called once by AppShell for as
// long as the app is open. A gap in the channel's history resyncs every
// window that is currently loaded.
export function watchCards(): () => void {
  return subscribeToCards(handleCardEvent, () => {
    for (const potId of Object.keys(windows)) void resyncPot(potId);
  });
}

// How long to wait, after the local optimistic reorder is applied,
// before sending the new position to PocketBase. This client is also
// subscribed to its own realtime "cards" updates (see
// watchPot above), and that handler always runs the FLIP
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
// renumbering any of them. Pinned cards sort first on the server too,
// so they all sit in the loaded window's first pages.
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

// Soft-deletes a card and drops it from the store right away, instead of
// waiting for the realtime echo of the update.
export async function removeCard(id: string): Promise<void> {
  const potId = cardsById[id]?.pot;
  await deleteCard(id);
  withCardsFlip(() => dropCard(id, potId));
}
