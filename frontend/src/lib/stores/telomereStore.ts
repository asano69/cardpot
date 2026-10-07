import { createSignal } from "solid-js";
import { createStore } from "solid-js/store";
import type { TelomereEntry } from "../models/telomere";

// How often the clock ticks. Thickness only changes at minute boundaries, so
// a few seconds is precise enough.
const CLOCK_INTERVAL_MS = 5_000;

const MINUTE_MS = 60_000;
const start = Date.now();

// Number of dummy lines. Large enough to scroll, so line ids can be checked
// anywhere in a long card.
const DUMMY_LINE_COUNT = 100;

const DUMMY_USERS = ["alice", "bob", "carol"] as const;
const DUMMY_STATUSES = ["read", "updated", "unread"] as const;
// Ages cycle through every thickness step of telomereThickness: under a
// minute, under an hour, under a day, and older.
const DUMMY_AGES_MS = [5_000, 20 * MINUTE_MS, 3 * 60 * MINUTE_MS, 2 * 24 * 60 * MINUTE_MS];

// Builds the dummy entries: line n gets a user, a status and an age picked
// from the lists above by its number, so a given line always looks the same.
function dummyEntries(): Record<number, TelomereEntry> {
  const result: Record<number, TelomereEntry> = {};
  for (let line = 0; line < DUMMY_LINE_COUNT; line++) {
    result[line] = {
      updatedAt: start - DUMMY_AGES_MS[line % DUMMY_AGES_MS.length],
      user: DUMMY_USERS[line % DUMMY_USERS.length],
      status: DUMMY_STATUSES[line % DUMMY_STATUSES.length],
    };
  }
  return result;
}

// Edit history per line, keyed by the 0-based line number.
//
// TODO: dummy data. The real history will live in a Y.Map of the card's ydoc,
// keyed by line id (see lib/models/lineId.ts) instead of a line number, which
// does not survive inserted and deleted lines. Only this store's source
// changes then; the editor plugin keeps reading it as it does now.
const [entries, setEntries] = createStore<Record<number, TelomereEntry>>(
  dummyEntries(),
);

export { setEntries as setTelomereEntries };

// The current time, ticking (see startTelomereClock). Reactive.
const [now, setNow] = createSignal(start);
export { now as telomereNow };

// Starts the clock and returns a function that stops it.
export function startTelomereClock(): () => void {
  const timer = setInterval(() => setNow(Date.now()), CLOCK_INTERVAL_MS);
  return () => clearInterval(timer);
}

// A plain copy of every entry. Reading every field makes a tracking scope
// re-run when any of them changes, which is what the editor bridge needs.
export function telomereSnapshot(): Record<number, TelomereEntry> {
  const copy: Record<number, TelomereEntry> = {};
  for (const [line, entry] of Object.entries(entries)) {
    copy[Number(line)] = { ...entry };
  }
  return copy;
}
