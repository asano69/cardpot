//
// Mirrors one pot's "cards" at a time into a local Solid store, backed
// by RxDB's local replica of that pot (see rxdb/cardsReplication.ts)
// instead of PocketBase's own paginated `getList` and a hand-rolled
// realtime reconciliation. A pot is "loaded" via ensurePotLoaded --
// called once per pot by PotLayout.tsx, which both CardList and
// CardForm sit under -- and "unloaded" via releasePot when the user
// leaves it. Because RxDB replicates a whole pot's cards to IndexedDB
// once opened (see cardsReplication.ts's own comment on this
// tradeoff), there is no separate "page" concept here anymore: once a
// pot's initial replication settles, every one of its cards is
// already queryable locally.
import { createStore, produce } from "solid-js/store";
import type { RxDocument } from "rxdb";
import { getDb, type CardsCollection } from "../rxdb/database";
import { startCardsReplication } from "../rxdb/cardsReplication";
import type { CardRxDoc } from "../rxdb/cardsSchema";
import { deleteCard, updateCard } from "../api/cardApi";
import { asCardTitle, type CardRecord } from "../models/card";
import { titleToSlug } from "../models/slugify";
import { computePosition } from "../position";
import { withCardsFlip, registerCardElement } from "../cardFlip";

// Re-exported so CardItem only needs to import from this module
// (cardFlip.ts's registration map is an implementation detail of how
// cards get animated, not something callers need to know about).
export { registerCardElement };

// Cache of the cards belonging to whichever pot(s) are currently
// loaded (see ensurePotLoaded). Entirely owned by the reactive query
// subscription started there -- nothing else writes a pot's cards
// into this store except the optimistic patches in moveCard/
// setCardPinned/removeCard below, which the next query emission
// reconciles against the authoritative local copy.
const [cardsById, setCardsById] = createStore<Record<string, CardRecord>>({});

export { cardsById };

// The cards of one loaded pot. `ids` are in load order only -- callers
// sort what they display (see CardList), since a realtime or local
// change can reorder cards inside it. Unlike the old paginated
// version, `ids` always covers the whole pot once `loaded` is true --
// there is no partial window to page through anymore.
export interface PotWindow {
  ids: string[];
  total: number;
  loaded: boolean;
}

const [windows, setWindows] = createStore<Record<string, PotWindow>>({});

// Reactive when called inside a tracking scope.
export function potWindow(potId: string | undefined): PotWindow | undefined {
  return potId ? windows[potId] : undefined;
}

// Converts one RxDB document into this store's CardRecord shape.
// "deleted" and "created" have no local equivalent: a soft-deleted
// card never reaches this function at all (RxDB's own _deleted flag
// already excludes it from every query result -- see
// cardsReplication.ts's toRxDoc), and nothing reads a live card's
// "created" timestamp.
function toCardRecord(doc: RxDocument<CardRxDoc>): CardRecord {
  const data = doc.toJSON();
  return {
    id: data.id,
    title: asCardTitle(data.title),
    description: data.description,
    image: data.image,
    pot: data.pot,
    position: data.position,
    pin: data.pin,
    deleted: "",
    created: "",
    updated: data.updated,
  };
}

interface PotSubscription {
  // Resolves once the pot's cards are queryable locally (see
  // ensurePotLoaded).
  ready: Promise<void>;
  stop: () => void;
}

const potSubscriptions = new Map<string, PotSubscription>();

// Starts mirroring potId's cards into cardsById/windows: a live RxDB
// replication (see cardsReplication.ts) plus a reactive query that
// keeps this store's copy in sync as the local replica changes,
// whether from the initial pull, a later poll, or another peer's
// realtime edit. Safe to call more than once for the same pot --
// later calls just return the same promise. The returned promise
// resolves once the pot's initial replication has completed, so a
// caller that needs to look a specific card up locally (see
// openCardBySlug) can await it first.
export function ensurePotLoaded(potId: string): Promise<void> {
  const existing = potSubscriptions.get(potId);
  if (existing) return existing.ready;

  setWindows(potId, { ids: [], total: 0, loaded: false });

  // `stop` starts as a no-op and is replaced once setup below
  // finishes; `stopRequested` covers the case where releasePot runs
  // before that -- the real `stop`, once assigned, is invoked right
  // away instead of being silently dropped.
  let stop: () => void = () => {};
  let stopRequested = false;

  const ready = (async () => {
    const db = await getDb();
    const collection: CardsCollection = db.cards;
    const { stopReplication, initialReplication } = startCardsReplication(
      collection,
      potId,
    );

    const query = collection.find({ selector: { pot: potId } });
    const subscription = query.$.subscribe((docs) => {
      withCardsFlip(() => {
        setCardsById(
          produce((store) => {
            const stillPresent = new Set(docs.map((doc) => doc.id));
            for (const id of Object.keys(store)) {
              if (store[id].pot === potId && !stillPresent.has(id)) {
                delete store[id];
              }
            }
            for (const doc of docs) {
              store[doc.id] = toCardRecord(doc);
            }
          }),
        );
        setWindows(potId, {
          ids: docs.map((doc) => doc.id),
          total: docs.length,
          loaded: true,
        });
      });
    });

    stop = () => {
      stopReplication();
      subscription.unsubscribe();
    };
    if (stopRequested) stop();

    await initialReplication;
  })();

  potSubscriptions.set(potId, {
    ready,
    stop: () => {
      stopRequested = true;
      stop();
    },
  });

  return ready;
}

// Stops mirroring potId and drops its cards from the store. Called
// when the user leaves the pot (see PotLayout).
export function releasePot(potId: string): void {
  const sub = potSubscriptions.get(potId);
  if (!sub) return;
  potSubscriptions.delete(potId);
  sub.stop();

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
}

// Resolves a card by its URL slug within an already-loaded pot,
// entirely against the local cardsById cache -- no network round trip
// (compare to the old server-side fetchCardBySlug this replaces,
// removed from lib/api/cardApi.ts). This only works once potId's
// cards are actually loaded locally, so callers must await
// ensurePotLoaded(potId) first (see CardForm.tsx, via PotLayout).
export function findCardByPotAndSlug(
  potId: string,
  slug: string,
): CardRecord | undefined {
  return Object.values(cardsById).find(
    (card) => card.pot === potId && titleToSlug(card.title) === slug,
  );
}

// Applies a partial update to a held card directly, animating any
// resulting grid reorder (see withCardsFlip). Used by moveCard/
// setCardPinned/removeCard below for immediate feedback; the next
// reactive query emission (from the eventual realtime echo) then
// reconciles this against the authoritative local copy. A full
// pending-overlay layer that survives a resync is left for a later
// round (see docs/rxdb-offline-sync-plan.md's 段階 C).
function patchCard(id: string, changes: Partial<CardRecord>): void {
  withCardsFlip(() => {
    setCardsById(id, (card) => (card ? { ...card, ...changes } : card));
  });
}

// Moves `card` to `position` (see lib/position.ts), applied
// immediately for a smooth drag, then persisted. Unlike the old
// version, no artificial delay is needed before the network request:
// that delay existed only to keep a local optimistic write from
// racing the realtime echo's own FLIP animation, and this store no
// longer makes that kind of local-only write to a shared,
// server-paginated cache -- cardsById here is a straight mirror of
// the local RxDB replica, so the eventual echo just reconfirms the
// same position withCardsFlip already animated to.
export function moveCard(card: CardRecord, position: number): void {
  const previousPosition = card.position;
  patchCard(card.id, { position });
  updateCard(card.id, { position }).catch((err) => {
    console.error("[cards] failed to reorder card:", err);
    patchCard(card.id, { position: previousPosition });
  });
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

// Pins or unpins a card, applying the server's authoritative response
// once it succeeds. Rejects on failure, leaving the store unchanged.
export async function setCardPinned(
  id: string,
  pinned: boolean,
): Promise<void> {
  const changes = pinned
    ? { pin: true, position: nextPinnedPosition(id) }
    : { pin: false };
  const updated = await updateCard(id, changes);
  patchCard(id, updated);
}

// Soft-deletes a card and drops it from the store right away, instead
// of waiting for the realtime echo.
export async function removeCard(id: string): Promise<void> {
  await deleteCard(id);
  withCardsFlip(() => {
    setCardsById(
      produce((store) => {
        delete store[id];
      }),
    );
  });
}
