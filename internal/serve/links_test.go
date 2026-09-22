package serve

import (
	"testing"

	"github.com/pocketbase/pocketbase/core"

	"github.com/asano69/cardpot/internal/slug"
)

// newLinksTestApp boots a throwaway app with the collections
// links1HopHandler touches: pots, cards, and card_links.
func newLinksTestApp(t *testing.T) core.App {
	t.Helper()

	app := core.NewBaseApp(core.BaseAppConfig{DataDir: t.TempDir()})
	if err := app.Bootstrap(); err != nil {
		t.Fatalf("bootstrap app: %v", err)
	}
	t.Cleanup(func() { _ = app.ResetBootstrapState() })

	pots := core.NewBaseCollection("pots")
	pots.Fields.Add(&core.TextField{Name: "name"})
	if err := app.Save(pots); err != nil {
		t.Fatalf("create pots collection: %v", err)
	}

	cards := core.NewBaseCollection("cards")
	cards.Fields.Add(
		&core.TextField{Name: "pot"},
		&core.TextField{Name: "title"},
		&core.TextField{Name: "titleLc"},
		&core.TextField{Name: "description"},
	)
	if err := app.Save(cards); err != nil {
		t.Fatalf("create cards collection: %v", err)
	}

	links := core.NewBaseCollection("card_links")
	links.Fields.Add(
		&core.TextField{Name: "source"},
		&core.TextField{Name: "target_pot"},
		&core.TextField{Name: "target_title"},
		&core.TextField{Name: "target_titleLc"},
	)
	if err := app.Save(links); err != nil {
		t.Fatalf("create card_links collection: %v", err)
	}

	return app
}

func createPot(t *testing.T, app core.App, name string) *core.Record {
	t.Helper()
	collection, err := app.FindCollectionByNameOrId("pots")
	if err != nil {
		t.Fatalf("find pots collection: %v", err)
	}
	record := core.NewRecord(collection)
	record.Set("name", name)
	if err := app.Save(record); err != nil {
		t.Fatalf("save pot: %v", err)
	}
	return record
}

func createLinksTestCard(t *testing.T, app core.App, pot, title, description string) *core.Record {
	t.Helper()
	collection, err := app.FindCollectionByNameOrId("cards")
	if err != nil {
		t.Fatalf("find cards collection: %v", err)
	}
	record := core.NewRecord(collection)
	record.Set("pot", pot)
	record.Set("title", title)
	record.Set("titleLc", slug.ToLowerKey(title))
	record.Set("description", description)
	if err := app.Save(record); err != nil {
		t.Fatalf("save card: %v", err)
	}
	return record
}

func createLink(t *testing.T, app core.App, source, targetPot, targetTitle string) {
	t.Helper()
	collection, err := app.FindCollectionByNameOrId("card_links")
	if err != nil {
		t.Fatalf("find card_links collection: %v", err)
	}
	record := core.NewRecord(collection)
	record.Set("source", source)
	record.Set("target_pot", targetPot)
	record.Set("target_title", targetTitle)
	record.Set("target_titleLc", slug.ToLowerKey(targetTitle))
	if err := app.Save(record); err != nil {
		t.Fatalf("save card_links: %v", err)
	}
}

func TestFindCardBySlug(t *testing.T) {
	app := newLinksTestApp(t)
	pot := createPot(t, app, "pot1")
	card := createLinksTestCard(t, app, pot.Id, "Hello World", "")

	got, err := findCardBySlug(app, pot.Id, "Hello_World")
	if err != nil {
		t.Fatalf("findCardBySlug: %v", err)
	}
	if got == nil || got.Id != card.Id {
		t.Errorf("findCardBySlug = %v, want %v", got, card.Id)
	}

	if got, err := findCardBySlug(app, pot.Id, "missing"); err != nil || got != nil {
		t.Errorf("findCardBySlug(missing) = (%v, %v), want (nil, nil)", got, err)
	}
}

func TestOwnTargetTitleLcs(t *testing.T) {
	app := newLinksTestApp(t)
	pot := createPot(t, app, "pot1")
	a := createLinksTestCard(t, app, pot.Id, "A", "")
	createLink(t, app, a.Id, pot.Id, "B")
	createLink(t, app, a.Id, pot.Id, "C")

	got, err := ownTargetTitleLcs(app, a.Id)
	if err != nil {
		t.Fatalf("ownTargetTitleLcs: %v", err)
	}
	if len(got) != 2 {
		t.Errorf("ownTargetTitleLcs = %v, want 2 entries", got)
	}
}

func TestLinks1Hop_MergesOutgoingAndIncoming(t *testing.T) {
	app := newLinksTestApp(t)
	pot := createPot(t, app, "pot1")

	center := createLinksTestCard(t, app, pot.Id, "Center", "center desc")
	createLinksTestCard(t, app, pot.Id, "OutTarget", "out desc")
	inSource := createLinksTestCard(t, app, pot.Id, "InSource", "in desc")

	// Center links out to OutTarget and to a page that doesn't exist yet.
	createLink(t, app, center.Id, pot.Id, "OutTarget")
	createLink(t, app, center.Id, pot.Id, "Ghost")
	// InSource links in to Center.
	createLink(t, app, inSource.Id, pot.Id, "Center")

	got, err := links1Hop(app, pot.Id, center.GetString("titleLc"), center.Id)
	if err != nil {
		t.Fatalf("links1Hop: %v", err)
	}

	if len(got) != 2 {
		t.Fatalf("got %d linked cards, want 2 (Ghost must be excluded): %v", len(got), got)
	}

	byTitle := make(map[string]linkedCard, len(got))
	for _, c := range got {
		byTitle[c.Title] = c
	}
	if _, ok := byTitle["OutTarget"]; !ok {
		t.Errorf("missing outgoing target %q in result: %v", "OutTarget", got)
	}
	if _, ok := byTitle["InSource"]; !ok {
		t.Errorf("missing incoming source %q in result: %v", "InSource", got)
	}
}
