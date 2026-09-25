import { createStore } from "solid-js/store";
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
const potSubscriptions = new Map<string, PotSubscription>();

// These reads intentionally go straight to SignalDB. `fetch`/`findOne` are
// reactive when called from a Solid tracking scope, eliminating the Dexie
// liveQuery-to-Solid-store mirror and its O(n) reconciliation pass.
export function cardsForPot(potId: string | undefined): CardRecord[] {
  if (!potId) return [];
  return potSubscriptions.get(potId)?.cards.find().fetch() ?? [];
}
export function cardById(id: string | undefined): CardRecord | undefined {
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
  const ready = replication.initialReplication.then(() => {
    if (!stopped)
      setWindows(potId, { total: cardsForPot(potId).length, loaded: true });
  });
  potSubscriptions.set(potId, {
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
  const sub = potSubscriptions.get(potId);
  if (!sub) return;
  potSubscriptions.delete(potId);
  sub.stop();
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

export function moveCard(card: CardRecord, position: number): void {
  const cards = potSubscriptions.get(card.pot)?.cards;
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
