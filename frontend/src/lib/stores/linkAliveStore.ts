import { createSignal } from "solid-js";
import { createStore, produce } from "solid-js/store";
import { computeAlive } from "../dexie/linkAliveQuery";

// Wiki link results shared by every view that shows links: the note editor,
// the card grid's descriptions and the "New Links" row. Only results live
// here, as booleans keyed by the link's target (pot, titleLc). How a result
// is computed is computeAlive's business alone.
//
// undefined means "not answered yet". Callers must treat it as alive, so a
// link never flashes red before its first answer.
const [alive, setAlive] = createStore<Record<string, boolean>>({});

// Bumped whenever a result changes. Solid views simply read the store; this
// is for consumers outside Solid's tracking (CodeMirror), which need one
// signal to re-run on.
const [version, setVersion] = createSignal(0);
export { version as linkAliveVersion };

// Delay that merges a burst of realtime events into one re-evaluation.
const REFRESH_DELAY_MS = 200;

// Every key somebody asked for. Only these are evaluated, so the cost is
// bounded by what the UI has shown.
const watched = new Map<string, { pot: string; lc: string }>();

// Pots whose replicas have finished their first sync. Evaluating earlier
// would read a half-filled replica and report live links as dead.
const readyPots = new Set<string>();

const keyOf = (pot: string, lc: string) => `${pot}:${lc}`;

// Reactive read: tracks this one key only.
export function linkAlive(pot: string, lc: string): boolean | undefined {
  return alive[keyOf(pot, lc)];
}

async function evaluate(key: string, pot: string, lc: string): Promise<void> {
  try {
    const value = await computeAlive(pot, lc);
    if (!watched.has(key)) return; // released while the query was running
    if (alive[key] === value) return;
    setAlive(key, value);
    setVersion((n) => n + 1);
  } catch (err) {
    console.error("[link-alive] failed to evaluate link:", err);
  }
}

// Asks for the result of a link target. Asking again is a no-op.
export function requestLinkAlive(pot: string, lc: string): void {
  const key = keyOf(pot, lc);
  if (watched.has(key)) return;
  watched.set(key, { pot, lc });
  if (readyPots.has(pot)) void evaluate(key, pot, lc);
}

// Called once a pot's replicas are synced (see PotLayout): answers every
// request that arrived before that.
export function markLinkAlivePotReady(pot: string): void {
  readyPots.add(pot);
  for (const [key, w] of watched) {
    if (w.pot === pot) void evaluate(key, w.pot, w.lc);
  }
}

let refreshTimer: ReturnType<typeof setTimeout> | undefined;

// Re-evaluates every requested key after the replicas changed (realtime
// events, resyncs).
export function refreshLinkAlive(): void {
  clearTimeout(refreshTimer);
  refreshTimer = setTimeout(() => {
    for (const [key, w] of watched) {
      if (readyPots.has(w.pot)) void evaluate(key, w.pot, w.lc);
    }
  }, REFRESH_DELAY_MS);
}

// Forgets a pot's requests and results when the user leaves it.
export function releaseLinkAlive(pot: string): void {
  readyPots.delete(pot);
  for (const [key, w] of watched) {
    if (w.pot === pot) watched.delete(key);
  }
  setAlive(
    produce((store) => {
      for (const key of Object.keys(store)) {
        if (key.startsWith(`${pot}:`)) delete store[key];
      }
    }),
  );
}
