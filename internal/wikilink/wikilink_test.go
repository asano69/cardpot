package wikilink

import (
	"testing"

	"github.com/pocketbase/pocketbase/core"

	"github.com/asano69/cardpot/internal/slug"
)

// newTestApp boots a throwaway PocketBase app with just the two collections
// Sync touches. Relation fields are plain text here, same as
// internal/serve's own test helpers.
func newTestApp(t *testing.T) core.App {
	t.Helper()

	app := core.NewBaseApp(core.BaseAppConfig{DataDir: t.TempDir()})
	if err := app.Bootstrap(); err != nil {
		t.Fatalf("bootstrap app: %v", err)
	}
	t.Cleanup(func() { _ = app.ResetBootstrapState() })

	cards := core.NewBaseCollection("cards")
	cards.Fields.Add(
		&core.TextField{Name: "pot"},
		&core.TextField{Name: "title"},
		&core.TextField{Name: "slug"},
	)
	if err := app.Save(cards); err != nil {
		t.Fatalf("create cards collection: %v", err)
	}

	links := core.NewBaseCollection("card_links")
	links.Fields.Add(
		&core.TextField{Name: "source"},
		&core.TextField{Name: "target"},
		&core.TextField{Name: "target_title"},
	)
	if err := app.Save(links); err != nil {
		t.Fatalf("create card_links collection: %v", err)
	}
	return app
}

func createCard(t *testing.T, app core.App, pot, title string) *core.Record {
	t.Helper()
	collection, err := app.FindCollectionByNameOrId("cards")
	if err != nil {
		t.Fatalf("find cards collection: %v", err)
	}
	record := core.NewRecord(collection)
	record.Set("pot", pot)
	record.Set("title", title)
	record.Set("slug", slug.FromTitle(title))
	if err := app.Save(record); err != nil {
		t.Fatalf("save card: %v", err)
	}
	return record
}

func linksFrom(t *testing.T, app core.App, source string) []*core.Record {
	t.Helper()
	records, err := app.FindRecordsByFilter("card_links", "source = {:source}", "", 0, 0, map[string]any{"source": source})
	if err != nil {
		t.Fatalf("list card_links: %v", err)
	}
	return records
}

func mustSync(t *testing.T, app core.App, cardID, text string) {
	t.Helper()
	if err := Sync(app, cardID, text); err != nil {
		t.Fatalf("Sync: %v", err)
	}
}

func TestSync_LinksToExistingCard(t *testing.T) {
	app := newTestApp(t)
	a := createCard(t, app, "pot1", "A")
	b := createCard(t, app, "pot1", "B")

	mustSync(t, app, a.Id, "A\nsee [B]")

	got := linksFrom(t, app, a.Id)
	if len(got) != 1 {
		t.Fatalf("got %d links, want 1", len(got))
	}
	if got[0].GetString("target") != b.Id || got[0].GetString("target_title") != "B" {
		t.Errorf("link = target %q title %q, want target %q title %q",
			got[0].GetString("target"), got[0].GetString("target_title"), b.Id, "B")
	}
}

func TestSync_IdentityIsTheSlug(t *testing.T) {
	// "a b" and "a_b" derive the same slug, so they are one link; the first
	// spelling in the text is the one kept.
	app := newTestApp(t)
	a := createCard(t, app, "pot1", "A")
	createCard(t, app, "pot1", "a b")

	mustSync(t, app, a.Id, "A\n[a_b] [a b]")

	got := linksFrom(t, app, a.Id)
	if len(got) != 1 {
		t.Fatalf("got %d links, want 1", len(got))
	}
	if got[0].GetString("target_title") != "a_b" {
		t.Errorf("target_title = %q, want %q", got[0].GetString("target_title"), "a_b")
	}
}

func TestSync_SkipsSelfUnresolvedAndOtherPots(t *testing.T) {
	app := newTestApp(t)
	a := createCard(t, app, "pot1", "A")
	createCard(t, app, "pot2", "Elsewhere")

	mustSync(t, app, a.Id, "A\n[A] [Nope] [Elsewhere]")

	if got := linksFrom(t, app, a.Id); len(got) != 0 {
		t.Errorf("got %d links, want 0", len(got))
	}
}

func TestSync_IgnoresTitleLine(t *testing.T) {
	app := newTestApp(t)
	a := createCard(t, app, "pot1", "A")
	createCard(t, app, "pot1", "B")

	mustSync(t, app, a.Id, "[B]\nbody")

	if got := linksFrom(t, app, a.Id); len(got) != 0 {
		t.Errorf("got %d links, want 0", len(got))
	}
}

func TestSync_AddsAndRemovesLinks(t *testing.T) {
	app := newTestApp(t)
	a := createCard(t, app, "pot1", "A")
	b := createCard(t, app, "pot1", "B")
	c := createCard(t, app, "pot1", "C")

	mustSync(t, app, a.Id, "A\n[B]")
	mustSync(t, app, a.Id, "A\n[C]")

	got := linksFrom(t, app, a.Id)
	if len(got) != 1 || got[0].GetString("target") != c.Id {
		t.Fatalf("links after edit = %d (want 1 to %s, not %s)", len(got), c.Id, b.Id)
	}

	mustSync(t, app, a.Id, "A\nno links")
	if got := linksFrom(t, app, a.Id); len(got) != 0 {
		t.Errorf("got %d links, want 0", len(got))
	}
}

func TestSync_UnchangedLinksAreNotRewritten(t *testing.T) {
	app := newTestApp(t)
	a := createCard(t, app, "pot1", "A")
	createCard(t, app, "pot1", "B")

	mustSync(t, app, a.Id, "A\n[B]")
	first := linksFrom(t, app, a.Id)
	mustSync(t, app, a.Id, "A\n[B] again")
	second := linksFrom(t, app, a.Id)

	if len(second) != 1 || second[0].Id != first[0].Id {
		t.Errorf("link record was replaced: %v -> %v", first[0].Id, second)
	}
}

func TestSync_DeletedCardIsIgnored(t *testing.T) {
	app := newTestApp(t)
	if err := Sync(app, "gone", "T\n[B]"); err != nil {
		t.Errorf("Sync on a missing card: %v", err)
	}
}
