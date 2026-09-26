import { createSignal } from "solid-js";
import { createStore } from "solid-js/store";
import { startCardsReplication } from "../signaldb/cardsReplication";
import type { CardRecord } from "../models/card";
import { titleToSlug } from "../models/slugify";
import { computePosition } from "../position";
import { withCardsFlip, registerCardElement } from "../cardFlip";

export { registerCardElement };

export interface PotWindow {
  total: number;
  loaded: boolean;
}

const [windows, setWindows] = createStore<Record<string, PotWindow>>({});
export function potWindow(potId: string | undefined): PotWindow | undefined {
  return potId ? windows[potId] : undefined;
}

interface PotSubscription {
  ready: Promise<void>;
  stop: () => void;
  cards: ReturnType<typeof startCardsReplication>["collection"];
}
// A plain Map, NOT a Solid store: a SignalDB Collection already carries its
// own Solid-reactive signals (via its own reactivity adapter), so nesting
// that class instance inside a Solid store's deeply-wrapped Proxy doubles up
// the reactivity and can feed back into itself (observed as a runaway
// render loop). A Map has no reactivity of its own, so it's safe to hold
// these live instances.
const potSubscriptions = new Map<string, PotSubscription>();

// ensurePotLoaded registers a pot's subscription from an effect that runs
// *after* a consumer's createMemo has already evaluated once (e.g.
// CardList's `cards`), so a memo reading potSubscriptions directly would
// never re-run once the real subscription (and its data) showed up later.
// This signal is bumped whenever a subscription is added or removed, purely
// to give such a memo something reactive to depend on -- it carries no data
// of its own, and the cards themselves stay reactive via SignalDB's own
// adapter.
const [subscriptionVersion, bumpSubscriptionVersion] = createSignal(0);

// These reads intentionally go straight to SignalDB. `fetch`/`findOne` are
// reactive when called from a Solid tracking scope, eliminating the Dexie
// liveQuery-to-Solid-store mirror and its O(n) reconciliation pass.
export function cardsForPot(potId: string | undefined): CardRecord[] {
  subscriptionVersion(); // track: see its own comment above
  if (!potId) return [];
  return potSubscriptions.get(potId)?.cards.find().fetch() ?? [];
}
export function cardById(id: string | undefined): CardRecord | undefined {
  subscriptionVersion(); // track: see its own comment above
  if (!id) return undefined;
  for (const { cards } of potSubscriptions.values()) {
    const card = cards.findOne({ id });
    if (card) return card;
  }
  return undefined;
}

export function ensurePotLoaded(potId: string): Promise<void> {
  const existing = potSubscriptions.get(potId);
  if (existing) return existing.ready;

  setWindows(potId, { total: 0, loaded: false });
  const replication = startCardsReplication(potId);
  let stopped = false;
  // Local IndexedDB hydration (near-instant, no network) is what the
  // UI waits on now, not a full network sync -- that used to make
  // CardList show its loading spinner on every open, even for a pot
  // whose 1000 cards were already cached from a previous visit.
  const ready = replication.collection.isReady().then(() => {
    if (!stopped)
      setWindows(potId, { total: cardsForPot(potId).length, loaded: true });
  });
  // The network sync keeps running in the background; once it lands,
  // refresh the footer's total count to match the server.
  replication.initialReplication.then(() => {
    if (!stopped) setWindows(potId, "total", cardsForPot(potId).length);
  });
  potSubscriptions.set(potId, {
    cards: replication.collection,
    ready,
    stop: () => {
      stopped = true;
      replication.stopReplication();
    },
  });
  bumpSubscriptionVersion((v) => v + 1);
  return ready;
}

export function releasePot(potId: string): void {
  const sub = potSubscriptions.get(potId);
  if (!sub) return;
  potSubscriptions.delete(potId);
  sub.stop();
  bumpSubscriptionVersion((v) => v + 1);
  setWindows(potId, undefined!);
}

export function findCardByPotAndSlug(
  potId: string,
  slug: string,
): CardRecord | undefined {
  return cardsForPot(potId).find((card) => titleToSlug(card.title) === slug);
}

// Created cards already exist on the server. Their local insertion makes them
// immediately readable while the normal realtime pull catches up.
export function mergeCards(records: CardRecord[]): void {
  for (const record of records) {
    const cards = potSubscriptions.get(record.pot)?.cards;
    cards?.replaceOne({ id: record.id }, record, { upsert: true });
  }
}

function findOwningCollection(id: string) {
  for (const sub of potSubscriptions.values()) {
    if (sub.cards.findOne({ id })) return sub.cards;
  }
  return undefined;
}

// The local write below is picked up by SignalDB's own change
// listener and pushed automatically (debounced ~100ms -- see
// @signaldb/sync's addCollection), so nothing here needs to trigger a
// sync explicitly. It is applied WITHOUT withCardsFlip on purpose:
// dnd-kit has already animated the drop itself, so FLIP-wrapping this
// same write would measure "before" from the card's pre-drag DOM
// position and animate it away from where dnd-kit just placed it --
// visible as a snap-back-then-forward flicker. Only the eventual
// remote echo of this change (see withCardsFlipAsync in
// cardsReplication.ts) still needs FLIP, since that one has no
// preceding drag animation to piggyback on.
export function moveCard(card: CardRecord, position: number): void {
  const cards = potSubscriptions.get(card.pot)?.cards;
  if (!cards) return;
  cards.updateOne({ id: card.id }, { $set: { position } });
}

function nextPinnedPosition(card: CardRecord): number {
  const positions = cardsForPot(card.pot)
    .filter((other) => other.pin && other.id !== card.id)
    .map((other) => other.position);
  return computePosition(
    undefined,
    positions.length ? Math.min(...positions) : undefined,
  );
}

export async function setCardPinned(
  id: string,
  pinned: boolean,
): Promise<void> {
  const card = cardById(id);
  const cards = findOwningCollection(id);
  if (!card || !cards) return;
  const changes = pinned
    ? { pin: true, position: nextPinnedPosition(card) }
    : { pin: false };
  withCardsFlip(() => cards.updateOne({ id }, { $set: changes }));
}

export async function removeCard(id: string): Promise<void> {
  const cards = findOwningCollection(id);
  if (!cards) return;
  withCardsFlip(() => cards.removeOne({ id }));
}
