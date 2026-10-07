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
	lines.Fields.Add(
		&core.TextField{Name: "card"},
		&core.TextField{Name: "pot"},
		&core.JSONField{Name: "lines"},
		&core.DateField{Name: "deleted"},
	)
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

func storedLinesRecord(t *testing.T, app core.App, cardID string) *core.Record {
	t.Helper()
	record, err := app.FindFirstRecordByFilter("card_lines", "card = {:card}", map[string]any{"card": cardID})
	if err != nil {
		t.Fatalf("find card_lines: %v", err)
	}
	return record
}

func TestSyncLines_StoresThePotOfTheCard(t *testing.T) {
	app := newLineWatchTestApp(t)
	card := createCard(t, app, "pot1", "A")

	if err := syncLines(app, card.Id, "A\nb"); err != nil {
		t.Fatalf("syncLines: %v", err)
	}
	if got := storedLinesRecord(t, app, card.Id).GetString("pot"); got != "pot1" {
		t.Errorf("pot = %q, want %q", got, "pot1")
	}
}

func TestSyncLines_FillsAMissingPot(t *testing.T) {
	// A record written before "pot" existed must become pullable again.
	app := newLineWatchTestApp(t)
	card := createCard(t, app, "pot1", "A")
	collection, err := app.FindCollectionByNameOrId("card_lines")
	if err != nil {
		t.Fatalf("find card_lines collection: %v", err)
	}
	old := core.NewRecord(collection)
	old.Set("card", card.Id)
	if err := app.Save(old); err != nil {
		t.Fatalf("save old record: %v", err)
	}

	if err := syncLines(app, card.Id, "A\nb"); err != nil {
		t.Fatalf("syncLines: %v", err)
	}
	if got := storedLinesRecord(t, app, card.Id).GetString("pot"); got != "pot1" {
		t.Errorf("pot = %q, want %q", got, "pot1")
	}
}

func TestSyncLines_IgnoresADeletedCard(t *testing.T) {
	app := newLineWatchTestApp(t)
	card := createCard(t, app, "pot1", "A")
	softDelete(t, app, card)

	if err := syncLines(app, card.Id, "A\nb"); err != nil {
		t.Fatalf("syncLines: %v", err)
	}
	if n, err := app.CountRecords("card_lines"); err != nil || n != 0 {
		t.Errorf("got %d card_lines records (err %v), want 0", n, err)
	}
}

func TestMarkLinesDeleted(t *testing.T) {
	app := newLineWatchTestApp(t)
	card := createCard(t, app, "pot1", "A")
	if err := syncLines(app, card.Id, "A\nb"); err != nil {
		t.Fatalf("syncLines: %v", err)
	}

	// The second call finds no live record and must not fail.
	for i := 0; i < 2; i++ {
		if err := markLinesDeleted(app, card.Id); err != nil {
			t.Fatalf("markLinesDeleted: %v", err)
		}
	}
	if storedLinesRecord(t, app, card.Id).GetDateTime("deleted").IsZero() {
		t.Error("card_lines record is not marked deleted")
	}
}

func TestCardLinesIsReplicatedByPot(t *testing.T) {
	if c := mustCollection(t, "card_lines"); c.PotField != "pot" {
		t.Errorf("PotField = %q, want %q", c.PotField, "pot")
	}
}
