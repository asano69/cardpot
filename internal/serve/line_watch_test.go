package serve

import (
	"encoding/json"
	"slices"
	"testing"

	"github.com/pocketbase/pocketbase/core"
)

func newLineWatchTestApp(t *testing.T) core.App {
	t.Helper()
	app := newSlugTestApp(t)
	lines := core.NewBaseCollection("card_lines")
	lines.Fields.Add(&core.TextField{Name: "card"}, &core.JSONField{Name: "lines"})
	if err := app.Save(lines); err != nil {
		t.Fatalf("create card_lines collection: %v", err)
	}
	return app
}

func storedIDs(t *testing.T, app core.App, cardID string) []string {
	t.Helper()
	record, err := app.FindFirstRecordByFilter("card_lines", "card = {:card}", map[string]any{"card": cardID})
	if err != nil {
		t.Fatalf("find card_lines: %v", err)
	}
	var entries []lineEntry
	if err := json.Unmarshal([]byte(record.GetString("lines")), &entries); err != nil {
		t.Fatalf("decode lines: %v", err)
	}
	return ids(entries)
}

func TestSyncLines_KeepsIDsAcrossEdits(t *testing.T) {
	app := newLineWatchTestApp(t)
	card := createCard(t, app, "pot1", "A")

	if err := syncLines(app, card.Id, "A\nb\nc"); err != nil {
		t.Fatalf("syncLines: %v", err)
	}
	first := storedIDs(t, app, card.Id)
	if len(first) != 3 {
		t.Fatalf("got %d ids, want 3", len(first))
	}

	if err := syncLines(app, card.Id, "A\nb edited\nc\nd"); err != nil {
		t.Fatalf("syncLines: %v", err)
	}
	second := storedIDs(t, app, card.Id)
	if !slices.Equal(second[:3], first) || len(second) != 4 {
		t.Errorf("ids = %v, want %v followed by one new id", second, first)
	}
}

func TestSyncLines_UnchangedTextWritesNothing(t *testing.T) {
	app := newLineWatchTestApp(t)
	card := createCard(t, app, "pot1", "A")
	if err := syncLines(app, card.Id, "A\nb"); err != nil {
		t.Fatalf("syncLines: %v", err)
	}
	before := storedIDs(t, app, card.Id)

	if err := syncLines(app, card.Id, "A\nb"); err != nil {
		t.Fatalf("syncLines: %v", err)
	}
	if got := storedIDs(t, app, card.Id); !slices.Equal(got, before) {
		t.Errorf("ids = %v, want %v", got, before)
	}
}
