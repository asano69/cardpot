import { createSignal } from "solid-js";
import { createStore } from "solid-js/store";
import type { TelomereEntry } from "../models/telomere";

// How often the clock ticks. Thickness only changes at minute boundaries, so
// a few seconds is precise enough.
const CLOCK_INTERVAL_MS = 5_000;

const MINUTE_MS = 60_000;
const start = Date.now();

// Edit history per line, keyed by the 0-based line number.
//
// TODO: dummy data. The real history will live in a Y.Map of the card's ydoc,
// and needs a line identity that survives inserted and deleted lines (a line
// number does not). Only this store's source changes then; the editor plugin
// keeps reading it as it does now.
const [entries, setEntries] = createStore<Record<number, TelomereEntry>>({
  0: { updatedAt: start - 2 * MINUTE_MS, user: "alice", status: "read" },
  1: { updatedAt: start - 5_000, user: "bob", status: "updated" },
  2: { updatedAt: start - 20 * MINUTE_MS, user: "alice", status: "unread" },
  3: { updatedAt: start - 3 * 60 * MINUTE_MS, user: "carol", status: "read" },
  4: {
    updatedAt: start - 2 * 24 * 60 * MINUTE_MS,
    user: "bob",
    status: "read",
  },
});

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
