package serve

import (
	"slices"
	"testing"
)

func TestLinkingCards_OnlyLiveCardsOfTheSamePot(t *testing.T) {
	app := newLinksTestApp(t)
	pot := createPot(t, app, "pot1")
	other := createPot(t, app, "pot2")

	self := createLinksTestCard(t, app, pot.Id, "Self", "")
	b := createLinksTestCard(t, app, pot.Id, "B", "")
	gone := createLinksTestCard(t, app, pot.Id, "Gone", "")
	elsewhere := createLinksTestCard(t, app, other.Id, "Elsewhere", "")
	createLink(t, app, self.Id, pot.Id, "Old") // the card's own link is reported too
	createLink(t, app, b.Id, pot.Id, "Old")
	createLink(t, app, gone.Id, pot.Id, "Old")
	createLink(t, app, elsewhere.Id, other.Id, "Old")
	softDelete(t, app, gone)

	got, err := linkingCards(app, pot.Id, "old")
	if err != nil {
		t.Fatalf("linkingCards: %v", err)
	}
	var titles []string
	for _, c := range got {
		titles = append(titles, c.Title)
	}
	if want := []string{"B", "Self"}; !slices.Equal(titles, want) {
		t.Errorf("titles = %q, want %q", titles, want)
	}
}

func TestTitleWatcherAlertRename(t *testing.T) {
	app := newLinksTestApp(t)
	pot := createPot(t, app, "pot1")
	card := createLinksTestCard(t, app, pot.Id, "New", "")
	b := createLinksTestCard(t, app, pot.Id, "B", "")
	createLink(t, app, b.Id, pot.Id, "Old")

	var got []string
	w := newTitleWatcher()
	w.notifyRename = func(cardID, oldTitle string, linkedFrom []string) error {
		got = append(got, cardID+"/"+oldTitle+"/"+linkedFrom[0])
		return nil
	}

	w.alertRename(app, pot.Id, card.Id, "Old", "New")     // linked: alert
	w.alertRename(app, pot.Id, card.Id, "Nobody", "New")  // no linkers: nothing
	w.alertRename(app, pot.Id, card.Id, "Old", "OLD")     // case only: nothing

	// Linked only from itself: nothing to warn about.
	selfOnly := createLinksTestCard(t, app, pot.Id, "Solo", "")
	createLink(t, app, selfOnly.Id, pot.Id, "Prev")
	w.alertRename(app, pot.Id, selfOnly.Id, "Prev", "Solo")

	// Linked from itself and another card: alert, listing both.
	mixed := createLinksTestCard(t, app, pot.Id, "Mixed", "")
	createLink(t, app, mixed.Id, pot.Id, "Was")
	createLink(t, app, b.Id, pot.Id, "Was")
	w.alertRename(app, pot.Id, mixed.Id, "Was", "Mixed")

	if want := []string{card.Id + "/Old/B", mixed.Id + "/Was/B"}; !slices.Equal(got, want) {
		t.Errorf("notifications = %q, want %q", got, want)
	}
}
