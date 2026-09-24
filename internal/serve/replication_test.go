package serve

import (
	"fmt"
	"net/url"
	"slices"
	"testing"

	"github.com/pocketbase/pocketbase/core"
)

const (
	pullT1 = "2026-01-01 00:00:01.000Z"
	pullT2 = "2026-01-01 00:00:02.000Z"
)

// pullCardID returns a valid 15-character record id that sorts by n.
func pullCardID(n int) string {
	return fmt.Sprintf("card%011d", n)
}

// newPullTestApp extends newLinksTestApp with an "updated" field. A plain
// text field stands in for the production autodate field, so tests can give
// several cards exactly the same value.
func newPullTestApp(t *testing.T) core.App {
	t.Helper()
	app := newLinksTestApp(t)

	cards, err := app.FindCollectionByNameOrId("cards")
	if err != nil {
		t.Fatalf("find cards collection: %v", err)
	}
	cards.Fields.Add(&core.TextField{Name: "updated"})
	if err := app.Save(cards); err != nil {
		t.Fatalf("extend cards collection: %v", err)
	}
	return app
}

func createPullCard(t *testing.T, app core.App, pot string, n int, updated string) *core.Record {
	t.Helper()
	collection, err := app.FindCollectionByNameOrId("cards")
	if err != nil {
		t.Fatalf("find cards collection: %v", err)
	}
	record := core.NewRecord(collection)
	record.Set("id", pullCardID(n))
	record.Set("pot", pot)
	record.Set("title", pullCardID(n))
	record.Set("titleLc", pullCardID(n))
	record.Set("updated", updated)
	if err := app.Save(record); err != nil {
		t.Fatalf("save card: %v", err)
	}
	return record
}

// pullFixture creates, in pot "pot1": card 3 (updated later), card 1 and
// card 2 (same "updated", card 2 soft-deleted); and card 9 in another pot.
// Card 3 is created first so the expected order can't come from insertion
// order.
func pullFixture(t *testing.T) core.App {
	t.Helper()
	app := newPullTestApp(t)
	createPullCard(t, app, "pot1", 3, pullT2)
	createPullCard(t, app, "pot1", 1, pullT1)
	softDelete(t, app, createPullCard(t, app, "pot1", 2, pullT1))
	createPullCard(t, app, "pot2", 9, pullT1)
	return app
}

func pulledIDs(t *testing.T, app core.App, after *cardCheckpoint, limit int) []string {
	t.Helper()
	records, err := pullCards(app, "pot1", after, limit)
	if err != nil {
		t.Fatalf("pullCards: %v", err)
	}
	ids := make([]string, len(records))
	for i, record := range records {
		ids[i] = record.Id
	}
	return ids
}

func TestPullCards_OrdersByUpdatedThenIDAndKeepsDeleted(t *testing.T) {
	app := pullFixture(t)

	got := pulledIDs(t, app, nil, 100)
	want := []string{pullCardID(1), pullCardID(2), pullCardID(3)}
	if !slices.Equal(got, want) {
		t.Errorf("ids = %v, want %v", got, want)
	}
}

func TestPullCards_ContinuesAfterCheckpoint(t *testing.T) {
	app := pullFixture(t)

	cases := []struct {
		name  string
		after cardCheckpoint
		want  []string
	}{
		// Cards 1 and 2 share the same "updated": the id decides.
		{"tie on updated, before the last of the tie", cardCheckpoint{pullT1, pullCardID(1)}, []string{pullCardID(2), pullCardID(3)}},
		{"tie on updated, at the last of the tie", cardCheckpoint{pullT1, pullCardID(2)}, []string{pullCardID(3)}},
		{"at the newest card", cardCheckpoint{pullT2, pullCardID(3)}, nil},
	}
	for _, tt := range cases {
		t.Run(tt.name, func(t *testing.T) {
			if got := pulledIDs(t, app, &tt.after, 100); !slices.Equal(got, tt.want) {
				t.Errorf("ids = %v, want %v", got, tt.want)
			}
		})
	}
}

func TestPullCards_RespectsLimit(t *testing.T) {
	app := pullFixture(t)

	got := pulledIDs(t, app, nil, 2)
	want := []string{pullCardID(1), pullCardID(2)}
	if !slices.Equal(got, want) {
		t.Errorf("ids = %v, want %v", got, want)
	}
}

func TestParsePullQuery(t *testing.T) {
	valid := []struct {
		query string
		after *cardCheckpoint
		limit int
	}{
		{"", nil, defaultPullLimit},
		{"limit=5", nil, 5},
		{"updatedAt=x&id=y&limit=1000", &cardCheckpoint{"x", "y"}, maxPullLimit},
	}
	for _, tt := range valid {
		q, _ := url.ParseQuery(tt.query)
		after, limit, err := parsePullQuery(q)
		if err != nil {
			t.Errorf("parsePullQuery(%q): %v", tt.query, err)
			continue
		}
		sameCheckpoint := (after == nil) == (tt.after == nil) && (after == nil || *after == *tt.after)
		if !sameCheckpoint || limit != tt.limit {
			t.Errorf("parsePullQuery(%q) = (%v, %d), want (%v, %d)", tt.query, after, limit, tt.after, tt.limit)
		}
	}

	for _, query := range []string{"limit=0", "limit=1001", "limit=abc", "updatedAt=x", "id=y"} {
		q, _ := url.ParseQuery(query)
		if _, _, err := parsePullQuery(q); err == nil {
			t.Errorf("parsePullQuery(%q) succeeded, want an error", query)
		}
	}
}
