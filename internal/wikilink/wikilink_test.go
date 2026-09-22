package wikilink

import (
	"testing"

	"github.com/pocketbase/pocketbase/core"
	// Registers PocketBase's system migrations, which create the internal
	// tables (_collections, ...) that Bootstrap reads. Nothing else this test
	// package imports pulls them in.
	_ "github.com/pocketbase/pocketbase/migrations"
)

// newTestApp boots a throwaway PocketBase app with just the two collections
// Sync touches. Sync only needs a card to exist, so "cards" has no extra
// fields, and the relation fields of card_links are plain text here, same as
// internal/serve's own test helpers.
func newTestApp(t *testing.T) core.App {
	t.Helper()

	app := core.NewBaseApp(core.BaseAppConfig{DataDir: t.TempDir()})
	if err := app.Bootstrap(); err != nil {
		t.Fatalf("bootstrap app: %v", err)
	}
	t.Cleanup(func() { _ = app.ResetBootstrapState() })

	cards := core.NewBaseCollection("cards")
	cards.Fields.Add(&core.TextField{Name: "pot"})
	if err := app.Save(cards); err != nil {
		t.Fatalf("create cards collection: %v", err)
	}

	links := core.NewBaseCollection("card_links")
	links.Fields.Add(
		&core.TextField{Name: "source"},
		&core.TextField{Name: "target_title"},
		&core.TextField{Name: "target_slug"},
		&core.TextField{Name: "target_pot"},
	)
	if err := app.Save(links); err != nil {
		t.Fatalf("create card_links collection: %v", err)
	}
	return app
}

func createCard(t *testing.T, app core.App) *core.Record {
	t.Helper()
	collection, err := app.FindCollectionByNameOrId("cards")
	if err != nil {
		t.Fatalf("find cards collection: %v", err)
	}
	record := core.NewRecord(collection)
	record.Set("pot", "pot1")
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

func TestSync_StoresLinksWithoutCheckingTargets(t *testing.T) {
	// No card named "B" exists anywhere: the link is stored all the same.
	app := newTestApp(t)
	a := createCard(t, app)

	mustSync(t, app, a.Id, "A\nsee [B] and [a b]")

	got := map[string]string{}
	for _, record := range linksFrom(t, app, a.Id) {
		got[record.GetString("target_slug")] = record.GetString("target_title")
		if record.GetString("target_pot") != "pot1" {
			t.Errorf("target_pot = %q, want %q", record.GetString("target_pot"), "pot1")
		}
	}
	want := map[string]string{"B": "B", "a_b": "a b"}
	if len(got) != len(want) || got["B"] != "B" || got["a_b"] != "a b" {
		t.Errorf("links = %v, want %v", got, want)
	}
}

func TestSync_IdentityIsTheSlug(t *testing.T) {
	// "a b" and "a_b" derive the same slug, so they are one link; the first
	// spelling in the text is the one kept.
	app := newTestApp(t)
	a := createCard(t, app)

	mustSync(t, app, a.Id, "A\n[a_b] [a b]")

	got := linksFrom(t, app, a.Id)
	if len(got) != 1 {
		t.Fatalf("got %d links, want 1", len(got))
	}
	if got[0].GetString("target_slug") != "a_b" || got[0].GetString("target_title") != "a_b" {
		t.Errorf("link = slug %q title %q, want %q / %q",
			got[0].GetString("target_slug"), got[0].GetString("target_title"), "a_b", "a_b")
	}
}

func TestSync_KeepsSelfLinks(t *testing.T) {
	// Whether a link points back at its own card is decided at query time,
	// so Sync stores it like any other.
	app := newTestApp(t)
	a := createCard(t, app)

	mustSync(t, app, a.Id, "A\n[A]")

	if got := linksFrom(t, app, a.Id); len(got) != 1 {
		t.Errorf("got %d links, want 1", len(got))
	}
}

func TestSync_SkipsLinksWithEmptySlug(t *testing.T) {
	// A link made only of brackets and spaces derives an empty slug, which
	// the schema cannot store.
	app := newTestApp(t)
	a := createCard(t, app)

	mustSync(t, app, a.Id, "A\n[ [ ] ]")

	if got := linksFrom(t, app, a.Id); len(got) != 0 {
		t.Errorf("got %d links, want 0", len(got))
	}
}

func TestSync_IgnoresTitleLine(t *testing.T) {
	app := newTestApp(t)
	a := createCard(t, app)

	mustSync(t, app, a.Id, "[B]\nbody")

	if got := linksFrom(t, app, a.Id); len(got) != 0 {
		t.Errorf("got %d links, want 0", len(got))
	}
}

func TestSync_AddsAndRemovesLinks(t *testing.T) {
	app := newTestApp(t)
	a := createCard(t, app)

	mustSync(t, app, a.Id, "A\n[B]")
	mustSync(t, app, a.Id, "A\n[C]")

	got := linksFrom(t, app, a.Id)
	if len(got) != 1 || got[0].GetString("target_slug") != "C" {
		t.Fatalf("links after edit = %d (want 1 to %q)", len(got), "C")
	}

	mustSync(t, app, a.Id, "A\nno links")
	if got := linksFrom(t, app, a.Id); len(got) != 0 {
		t.Errorf("got %d links, want 0", len(got))
	}
}

func TestSync_UnchangedLinksAreNotRewritten(t *testing.T) {
	app := newTestApp(t)
	a := createCard(t, app)

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
