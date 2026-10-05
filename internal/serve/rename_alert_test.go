package serve

import (
	"slices"
	"testing"
)

func TestLinkingCardTitles_OnlyLiveOtherCardsOfTheSamePot(t *testing.T) {
	app := newLinksTestApp(t)
	pot := createPot(t, app, "pot1")
	other := createPot(t, app, "pot2")

	self := createLinksTestCard(t, app, pot.Id, "Self", "")
	b := createLinksTestCard(t, app, pot.Id, "B", "")
	gone := createLinksTestCard(t, app, pot.Id, "Gone", "")
	elsewhere := createLinksTestCard(t, app, other.Id, "Elsewhere", "")
	createLink(t, app, self.Id, pot.Id, "Old") // the card's own link is not reported
	createLink(t, app, b.Id, pot.Id, "Old")
	createLink(t, app, gone.Id, pot.Id, "Old")
	createLink(t, app, elsewhere.Id, other.Id, "Old")
	softDelete(t, app, gone)

	got, err := linkingCardTitles(app, pot.Id, "old", self.Id)
	if err != nil {
		t.Fatalf("linkingCardTitles: %v", err)
	}
	if want := []string{"B"}; !slices.Equal(got, want) {
		t.Errorf("titles = %q, want %q", got, want)
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

	if want := []string{card.Id + "/Old/B"}; !slices.Equal(got, want) {
		t.Errorf("notifications = %q, want %q", got, want)
	}
}
