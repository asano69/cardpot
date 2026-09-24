// internal/realtime/register_test.go
package realtime

import (
	"encoding/json"
	"errors"
	"testing"

	"github.com/pocketbase/pocketbase/core"
	// Registers PocketBase's system migrations (creates _superusers etc.),
	// which Bootstrap needs.
	_ "github.com/pocketbase/pocketbase/migrations"
)

const testPassword = "password123"

func newTestApp(t *testing.T) core.App {
	t.Helper()

	app := core.NewBaseApp(core.BaseAppConfig{DataDir: t.TempDir()})
	if err := app.Bootstrap(); err != nil {
		t.Fatalf("bootstrap app: %v", err)
	}
	t.Cleanup(func() { _ = app.ResetBootstrapState() })

	cards := core.NewBaseCollection("cards")
	cards.Fields.Add(&core.TextField{Name: "pot"}, &core.TextField{Name: "title"})
	if err := app.Save(cards); err != nil {
		t.Fatalf("create cards collection: %v", err)
	}
	return app
}

type published struct {
	channel string
	data    []byte
}

// newTestHub returns a hub whose publications are captured instead of sent.
func newTestHub(app core.App, publishErr error) (*Hub, *[]published) {
	var got []published
	hub := &Hub{publish: func(channel string, data []byte) error {
		got = append(got, published{channel, data})
		return publishErr
	}}
	hub.BindCardHooks(app)
	return hub, &got
}

func saveCard(t *testing.T, app core.App, pot, title string) *core.Record {
	t.Helper()
	collection, err := app.FindCollectionByNameOrId("cards")
	if err != nil {
		t.Fatalf("find cards collection: %v", err)
	}
	record := core.NewRecord(collection)
	record.Set("pot", pot)
	record.Set("title", title)
	if err := app.Save(record); err != nil {
		t.Fatalf("save card: %v", err)
	}
	return record
}

func decode(t *testing.T, p published) (action, id string) {
	t.Helper()
	var event struct {
		Action string `json:"action"`
		Record struct {
			ID string `json:"id"`
		} `json:"record"`
	}
	if err := json.Unmarshal(p.data, &event); err != nil {
		t.Fatalf("decode payload %s: %v", p.data, err)
	}
	return event.Action, event.Record.ID
}

func TestCardHooks_PublishCreateUpdateDeleteToCardsChannel(t *testing.T) {
	app := newTestApp(t)
	_, got := newTestHub(app, nil)

	card := saveCard(t, app, "pot1", "A")
	card.Set("title", "B")
	if err := app.Save(card); err != nil {
		t.Fatalf("update card: %v", err)
	}
	if err := app.Delete(card); err != nil {
		t.Fatalf("delete card: %v", err)
	}

	want := []string{"create", "update", "delete"}
	if len(*got) != len(want) {
		t.Fatalf("got %d publications, want %d", len(*got), len(want))
	}
	for i, p := range *got {
		if p.channel != CardsChannel {
			t.Errorf("publication %d channel = %q, want %q", i, p.channel, CardsChannel)
		}
		action, id := decode(t, p)
		if action != want[i] || id != card.Id {
			t.Errorf("publication %d = (%q, %q), want (%q, %q)", i, action, id, want[i], card.Id)
		}
	}
}

func TestCardHooks_PublishFailureDoesNotFailTheSave(t *testing.T) {
	app := newTestApp(t)
	newTestHub(app, errors.New("boom"))

	saveCard(t, app, "pot1", "A") // fails the test if the save returns an error
}

func TestCardHooks_IgnoreOtherCollections(t *testing.T) {
	app := newTestApp(t)
	_, got := newTestHub(app, nil)

	other := core.NewBaseCollection("others")
	other.Fields.Add(&core.TextField{Name: "pot"})
	if err := app.Save(other); err != nil {
		t.Fatalf("create collection: %v", err)
	}
	record := core.NewRecord(other)
	record.Set("pot", "pot1")
	if err := app.Save(record); err != nil {
		t.Fatalf("save record: %v", err)
	}

	if len(*got) != 0 {
		t.Errorf("got %d publications, want 0", len(*got))
	}
}

// newAuthRecord saves a record with a password in collection and returns its
// auth token.
func newAuthRecord(t *testing.T, app core.App, collection *core.Collection, email string) (*core.Record, string) {
	t.Helper()
	record := core.NewRecord(collection)
	record.SetEmail(email)
	record.SetPassword(testPassword)
	if err := app.Save(record); err != nil {
		t.Fatalf("save auth record: %v", err)
	}
	token, err := record.NewAuthToken()
	if err != nil {
		t.Fatalf("new auth token: %v", err)
	}
	return record, token
}

func TestAuthenticate(t *testing.T) {
	app := newTestApp(t)

	superusers, err := app.FindCollectionByNameOrId(core.CollectionNameSuperusers)
	if err != nil {
		t.Fatalf("find superusers collection: %v", err)
	}
	superuser, superuserToken := newAuthRecord(t, app, superusers, "admin@example.com")

	members := core.NewAuthCollection("members")
	if err := app.Save(members); err != nil {
		t.Fatalf("create members collection: %v", err)
	}
	_, memberToken := newAuthRecord(t, app, members, "member@example.com")

	if got, err := authenticate(app, superuserToken); err != nil || got != superuser.Id {
		t.Errorf("superuser: authenticate = (%q, %v), want (%q, nil)", got, err, superuser.Id)
	}
	if _, err := authenticate(app, memberToken); err == nil {
		t.Error("non-superuser token was accepted")
	}
	if _, err := authenticate(app, "not-a-token"); err == nil {
		t.Error("garbage token was accepted")
	}
	if _, err := authenticate(app, ""); err == nil {
		t.Error("empty token was accepted")
	}
}
