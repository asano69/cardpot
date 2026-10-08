import { createSignal } from "solid-js";

// How often the clock ticks. Thickness only changes at minute boundaries, so
// a few seconds is precise enough.
const CLOCK_INTERVAL_MS = 5_000;

// The current time, ticking (see startTelomereClock). Reactive. The edit
// history itself is per card and lives in its Y.Doc (see lineMetaStore.ts).
const [now, setNow] = createSignal(Date.now());
export { now as telomereNow };

// Starts the clock and returns a function that stops it.
export function startTelomereClock(): () => void {
  const timer = setInterval(() => setNow(Date.now()), CLOCK_INTERVAL_MS);
  return () => clearInterval(timer);
}
