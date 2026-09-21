// The card CardForm last observed: which card is open and the title it had.
export interface SyncedCard {
  id?: string;
  title?: string;
}

// Decides whether the address bar should be rewritten with history.replaceState
// after the observed card changed from `prev` to `next`.
//
// Only a rename of the card that stays open qualifies. When the open card
// merely changes because of a router navigation (e.g. following a wiki link),
// the router has not pushed the new history entry yet -- it does so after the
// transition settles -- so a replaceState at that point would overwrite the
// entry being left and leave two identical entries in the history.
//
// A title that was not known before is not a rename either: there is nothing
// to compare against, and the URL was already derived from that card when it
// was opened.
export function isRenameOfOpenCard(
  prev: SyncedCard,
  next: SyncedCard,
): boolean {
  return (
    next.id !== undefined &&
    next.title !== undefined &&
    prev.id === next.id &&
    prev.title !== undefined &&
    prev.title !== next.title
  );
}
