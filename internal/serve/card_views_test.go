package serve

import (
	"encoding/json"
	"errors"
	"maps"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
	"time"

	"github.com/pocketbase/dbx"
	"github.com/pocketbase/pocketbase/core"
	"github.com/pocketbase/pocketbase/tools/router"
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
		&core.DateField{Name: "left"},
		&core.JSONField{Name: "seen"},
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

func TestUpsertCardLeft_IsIndependentOfTheViewCount(t *testing.T) {
	app := newViewsTestApp(t)

	if err := upsertCardView(app, "alice", "card1"); err != nil {
		t.Fatalf("upsertCardView: %v", err)
	}
	if err := upsertCardLeft(app, "alice", "card1"); err != nil {
		t.Fatalf("upsertCardLeft: %v", err)
	}
	// A leave without a recorded view still creates the row.
	if err := upsertCardLeft(app, "bob", "card1"); err != nil {
		t.Fatalf("upsertCardLeft: %v", err)
	}

	alice := viewRows(t, app, "card1", "alice")
	if len(alice) != 1 || alice[0].GetInt("count") != 1 || alice[0].GetDateTime("left").IsZero() {
		t.Errorf("alice = %d rows, count %d, left zero %v; want 1 row, count 1, left set",
			len(alice), alice[0].GetInt("count"), alice[0].GetDateTime("left").IsZero())
	}
	bob := viewRows(t, app, "card1", "bob")
	if len(bob) != 1 || bob[0].GetInt("count") != 0 || bob[0].GetDateTime("left").IsZero() {
		t.Errorf("bob row = %v, want 1 row with count 0 and left set", bob)
	}
}

func TestMergeSeen_TakesTheMaximumPerClient(t *testing.T) {
	a := map[string]uint64{"1": 5, "2": 3}
	b := map[string]uint64{"1": 2, "3": 7}

	want := map[string]uint64{"1": 5, "2": 3, "3": 7}
	if got := mergeSeen(a, b); !maps.Equal(got, want) {
		t.Errorf("mergeSeen(a, b) = %v, want %v", got, want)
	}
	if got := mergeSeen(b, a); !maps.Equal(got, want) {
		t.Errorf("mergeSeen(b, a) = %v, want %v (order must not matter)", got, want)
	}
	if got := mergeSeen(nil, nil); got == nil || len(got) != 0 {
		t.Errorf("mergeSeen(nil, nil) = %#v, want an empty non-nil map", got)
	}
}

// authStub returns an unsaved auth record of the given collection. The seen
// handlers only read its id and its collection.
func authStub(t *testing.T, app core.App, collection string) *core.Record {
	t.Helper()
	c, err := app.FindCollectionByNameOrId(collection)
	if err != nil {
		t.Fatalf("find %s collection: %v", collection, err)
	}
	record := core.NewRecord(c)
	record.Id = "aaaaaaaaaaaaaaa"
	return record
}

// callSeen runs a seen handler as authRecord and returns its error and the
// recorded response.
func callSeen(
	app core.App, handler func(*core.RequestEvent) error,
	authRecord *core.Record, method, cardID, body string,
) (error, *httptest.ResponseRecorder) {
	req := httptest.NewRequest(method, "/api/admin/cards/"+cardID+"/seen", strings.NewReader(body))
	req.SetPathValue("id", cardID)
	req.Header.Set("Content-Type", "application/json")
	rec := httptest.NewRecorder()
	e := &core.RequestEvent{App: app, Auth: authRecord, Event: router.Event{Request: req, Response: rec}}
	return handler(e), rec
}

func decodeSeen(t *testing.T, rec *httptest.ResponseRecorder) map[string]uint64 {
	t.Helper()
	var res struct {
		Seen map[string]uint64 `json:"seen"`
	}
	if err := json.Unmarshal(rec.Body.Bytes(), &res); err != nil {
		t.Fatalf("decode %q: %v", rec.Body.String(), err)
	}
	return res.Seen
}

func TestSeenHandlers_NeverLowerWhatWasStored(t *testing.T) {
	app := newViewsTestApp(t)
	card := createCard(t, app, "pot1", "A")
	user := authStub(t, app, "users")

	for _, body := range []string{
		`{"seen":{"1":5,"2":3}}`,
		`{"seen":{"1":2,"3":7}}`, // a stale device: client 1 must stay at 5
	} {
		err, rec := callSeen(app, postSeenHandler, user, http.MethodPost, card.Id, body)
		if err != nil || rec.Code != http.StatusNoContent {
			t.Fatalf("POST %s = (%v, %d), want 204", body, err, rec.Code)
		}
	}

	err, rec := callSeen(app, getSeenHandler, user, http.MethodGet, card.Id, "")
	if err != nil {
		t.Fatalf("GET: %v", err)
	}
	want := map[string]uint64{"1": 5, "2": 3, "3": 7}
	if got := decodeSeen(t, rec); !maps.Equal(got, want) {
		t.Errorf("seen = %v, want %v", got, want)
	}
}

func TestSeenHandlers_KeepUsersApart(t *testing.T) {
	app := newViewsTestApp(t)
	card := createCard(t, app, "pot1", "A")
	alice := authStub(t, app, "users")
	bob := authStub(t, app, "users")
	bob.Id = "bbbbbbbbbbbbbbb"

	if err, _ := callSeen(app, postSeenHandler, alice, http.MethodPost, card.Id, `{"seen":{"1":5}}`); err != nil {
		t.Fatalf("POST: %v", err)
	}
	err, rec := callSeen(app, getSeenHandler, bob, http.MethodGet, card.Id, "")
	if err != nil {
		t.Fatalf("GET: %v", err)
	}
	if got := decodeSeen(t, rec); len(got) != 0 {
		t.Errorf("bob's seen = %v, want empty", got)
	}
}

func TestSeenHandlers_SuperuserIsNotTracked(t *testing.T) {
	app := newViewsTestApp(t)
	card := createCard(t, app, "pot1", "A")
	admin := authStub(t, app, core.CollectionNameSuperusers)

	err, rec := callSeen(app, postSeenHandler, admin, http.MethodPost, card.Id, `{"seen":{"1":5}}`)
	if err != nil || rec.Code != http.StatusNoContent {
		t.Fatalf("POST = (%v, %d), want 204", err, rec.Code)
	}
	if rows := viewRows(t, app, card.Id, admin.Id); len(rows) != 0 {
		t.Errorf("got %d card_views rows for a superuser, want 0", len(rows))
	}

	err, rec = callSeen(app, getSeenHandler, admin, http.MethodGet, card.Id, "")
	if err != nil {
		t.Fatalf("GET: %v", err)
	}
	if got := decodeSeen(t, rec); got == nil || len(got) != 0 {
		t.Errorf("seen = %#v, want an empty object", got)
	}
}

func TestSeenHandlers_UnknownOrDeletedCardIs404(t *testing.T) {
	app := newViewsTestApp(t)
	deleted := createCard(t, app, "pot1", "A")
	softDelete(t, app, deleted)
	user := authStub(t, app, "users")

	for _, id := range []string{"missing", deleted.Id} {
		err, _ := callSeen(app, getSeenHandler, user, http.MethodGet, id, "")
		var apiErr *router.ApiError
		if !errors.As(err, &apiErr) || apiErr.Status != http.StatusNotFound {
			t.Errorf("GET card %q: err = %v, want a 404", id, err)
		}
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
