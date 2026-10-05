import { createStore, produce } from "solid-js/store";
import { subscribeToChannel } from "../api/realtime";

// The server's RenameAlertChannel (see internal/realtime/hub.go).
const CHANNEL = "card_rename_alerts";

// Sent when a card is renamed away from a title other cards still link to
// (see PublishRenameAlert in internal/realtime/register.go). The new title is
// not part of it: the view reads the card's current title itself, so it stays
// right while the user keeps typing.
export interface RenameAlertEvent {
  cardId: string;
  oldTitle: string;
  // Titles of the cards that link to oldTitle.
  linkedFrom: string[];
}

const [alerts, setAlerts] = createStore<Record<string, RenameAlertEvent>>({});

// The pending rename alert of a card, if any. Reactive when called inside a
// tracking scope.
export function renameAlertOf(
  cardId: string | undefined,
): RenameAlertEvent | undefined {
  return cardId ? alerts[cardId] : undefined;
}

export function dismissRenameAlert(cardId: string): void {
  setAlerts(
    produce((store) => {
      delete store[cardId];
    }),
  );
}

// Keeps the alerts current and returns a function that stops watching. Called
// once by AppShell for as long as the app is open. A missed alert is not
// recovered: the next rename of the card sends a fresh one.
export function watchRenameAlerts(): () => void {
  return subscribeToChannel<RenameAlertEvent>(
    CHANNEL,
    (event) => setAlerts(event.cardId, event),
    () => {},
  );
}
