import { createStore, produce } from "solid-js/store";
import { subscribeToChannel } from "../api/realtime";

// The server's MergeAlertChannel (see internal/realtime/hub.go).
const CHANNEL = "card_alerts";

// A card's duplicate-title alert, as the server publishes it (see
// PublishMergeAlert in internal/realtime/register.go). mergeTarget is the
// title the card duplicates, or null once it no longer does.
export interface MergeAlertEvent {
  cardId: string;
  mergeTarget: string | null;
}

// The title each card currently duplicates, keyed by card id.
const [targets, setTargets] = createStore<Record<string, string>>({});

// The title the card duplicates, if any. Reactive when called inside a
// tracking scope.
export function mergeTargetOf(cardId: string | undefined): string | undefined {
  return cardId ? targets[cardId] : undefined;
}

export function handleMergeAlert(event: MergeAlertEvent): void {
  if (event.mergeTarget) {
    setTargets(event.cardId, event.mergeTarget);
  } else {
    setTargets(
      produce((store) => {
        delete store[event.cardId];
      }),
    );
  }
}

// Keeps the alerts current and returns a function that stops watching. Called
// once by AppShell for as long as the app is open. A missed alert is not
// recovered: the next title check of the card sends a fresh one.
export function watchMergeAlerts(): () => void {
  return subscribeToChannel<MergeAlertEvent>(
    CHANNEL,
    handleMergeAlert,
    () => {},
  );
}
