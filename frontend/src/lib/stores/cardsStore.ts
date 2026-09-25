import { createStore, produce } from "solid-js/store";
import { startCardsReplication } from "../dexie/cardsReplication";
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
// A Solid store, not a plain Map: ensurePotLoaded registers a pot's
// subscription from an effect that runs *after* a consumer's createMemo has
// already evaluated once (e.g. CardList's `cards`). A plain Map has no
// reactivity, so a memo that first read a not-yet-registered pot would never
// re-run once the real subscription (and its data) showed up later. Solid's
// store still tracks a read of a key that doesn't exist yet, so setting that
// key afterwards correctly invalidates the memo.
const [subscriptions, setSubscriptions] = createStore<
  Record<string, PotSubscription>
>({});

// These reads intentionally go straight to SignalDB. `fetch`/`findOne` are
// reactive when called from a Solid tracking scope, eliminating the Dexie
// liveQuery-to-Solid-store mirror and its O(n) reconciliation pass.
export function cardsForPot(potId: string | undefined): CardRecord[] {
  if (!potId) return [];
  return subscriptions[potId]?.cards.find().fetch() ?? [];
}
export function cardById(id: string | undefined): CardRecord | undefined {
  if (!id) return undefined;
  for (const potId in subscriptions) {
    const card = subscriptions[potId].cards.findOne({ id });
    if (card) return card;
  }
  return undefined;
}

export function ensurePotLoaded(potId: string): Promise<void> {
  const existing = subscriptions[potId];
  if (existing) return existing.ready;

  setWindows(potId, { total: 0, loaded: false });
  const replication = startCardsReplication(potId);
  let stopped = false;
  const ready = replication.initialReplication.then(() => {
    if (!stopped)
      setWindows(potId, { total: cardsForPot(potId).length, loaded: true });
  });
  setSubscriptions(potId, {
    cards: replication.collection,
    ready,
    stop: () => {
      stopped = true;
      replication.stopReplication();
    },
  });
  return ready;
}

export function releasePot(potId: string): void {
  const sub = subscriptions[potId];
  if (!sub) return;
  sub.stop();
  setSubscriptions(
    produce((store) => {
      delete store[potId];
    }),
  );
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
    const cards = subscriptions[record.pot]?.cards;
    cards?.replaceOne({ id: record.id }, record, { upsert: true });
  }
}

function findOwningCollection(id: string) {
  for (const potId in subscriptions) {
    const cards = subscriptions[potId].cards;
    if (cards.findOne({ id })) return cards;
  }
  return undefined;
}

export function moveCard(card: CardRecord, position: number): void {
  const cards = subscriptions[card.pot]?.cards;
  if (!cards) return;
  withCardsFlip(() => cards.updateOne({ id: card.id }, { $set: { position } }));
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
