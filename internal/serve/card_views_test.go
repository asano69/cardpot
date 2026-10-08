package serve

import (
	"testing"
	"time"

	"github.com/pocketbase/dbx"
	"github.com/pocketbase/pocketbase/core"
)

// newViewsTestApp extends newSlugTestApp with the "card_views" collection.
// The relation fields are plain text here, like the other test helpers.
func newViewsTestApp(t *testing.T) core.App {
	t.Helper()
	app := newSlugTestApp(t)

	views := core.NewBaseCollection("card_views")
	views.Fields.Add(
		&core.TextField{Name: "card"},
		&core.TextField{Name: "user"},
		&core.NumberField{Name: "count"},
		&core.DateField{Name: "viewed"},
	)
	if err := app.Save(views); err != nil {
		t.Fatalf("create card_views collection: %v", err)
	}
	return app
}

func viewRows(t *testing.T, app core.App, card, user string) []*core.Record {
	t.Helper()
	rows, err := app.FindRecordsByFilter(
		"card_views", "card = {:card} && user = {:user}", "", 0, 0,
		dbx.Params{"card": card, "user": user},
	)
	if err != nil {
		t.Fatalf("list card_views: %v", err)
	}
	return rows
}

func TestUpsertCardView_CountsPerCardAndUser(t *testing.T) {
	app := newViewsTestApp(t)

	for i := 0; i < 2; i++ {
		if err := upsertCardView(app, "alice", "card1"); err != nil {
			t.Fatalf("upsertCardView: %v", err)
		}
	}
	if err := upsertCardView(app, "bob", "card1"); err != nil {
		t.Fatalf("upsertCardView: %v", err)
	}

	alice := viewRows(t, app, "card1", "alice")
	if len(alice) != 1 || alice[0].GetInt("count") != 2 {
		t.Fatalf("alice rows = %d (count %d), want 1 row with count 2", len(alice), alice[0].GetInt("count"))
	}
	if alice[0].GetDateTime("viewed").IsZero() {
		t.Error("viewed was not set")
	}
	if bob := viewRows(t, app, "card1", "bob"); len(bob) != 1 || bob[0].GetInt("count") != 1 {
		t.Errorf("bob rows = %d, want 1 row with count 1", len(bob))
	}
}

func TestViewTracker_DedupesWithinTheWindow(t *testing.T) {
	tracker := newViewTracker()
	start := time.Now()

	if !tracker.shouldRecord("alice", "card1", start) {
		t.Fatal("first view was not counted")
	}
	if tracker.shouldRecord("alice", "card1", start.Add(viewDedupeWindow-time.Second)) {
		t.Error("a reconnect inside the window was counted")
	}
	if !tracker.shouldRecord("alice", "card1", start.Add(viewDedupeWindow)) {
		t.Error("a view after the window was not counted")
	}
	// Another user or another card is a different view.
	if !tracker.shouldRecord("bob", "card1", start) || !tracker.shouldRecord("alice", "card2", start) {
		t.Error("a different user or card was deduped")
	}
}
