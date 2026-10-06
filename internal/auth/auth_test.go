package auth

import (
	"errors"
	"testing"
	"time"

	"github.com/pocketbase/pocketbase/core"
	"github.com/pocketbase/pocketbase/tools/types"
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
	cards.Fields.Add(&core.DateField{Name: "deleted"})
	if err := app.Save(cards); err != nil {
		t.Fatalf("create cards collection: %v", err)
	}
	return app
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

func TestVerify(t *testing.T) {
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
	member, memberToken := newAuthRecord(t, app, members, "member@example.com")

	if got, err := Verify(app, superuserToken); err != nil || got.UserID != superuser.Id {
		t.Errorf("superuser: Verify = (%+v, %v), want user %q", got, err, superuser.Id)
	}
	if got, err := Verify(app, memberToken); err != nil || got.UserID != member.Id {
		t.Errorf("regular user: Verify = (%+v, %v), want user %q", got, err, member.Id)
	}
	if _, err := Verify(app, "not-a-token"); !errors.Is(err, ErrInvalidToken) {
		t.Errorf("garbage token: err = %v, want ErrInvalidToken", err)
	}
	if _, err := Verify(app, ""); !errors.Is(err, ErrInvalidToken) {
		t.Errorf("empty token: err = %v, want ErrInvalidToken", err)
	}
}

func TestVerify_ReportsTheTokenExpiry(t *testing.T) {
	app := newTestApp(t)
	superusers, err := app.FindCollectionByNameOrId(core.CollectionNameSuperusers)
	if err != nil {
		t.Fatalf("find superusers collection: %v", err)
	}
	_, token := newAuthRecord(t, app, superusers, "admin@example.com")

	got, err := Verify(app, token)
	if err != nil {
		t.Fatalf("Verify: %v", err)
	}
	if !got.ExpiresAt.After(time.Now()) {
		t.Errorf("ExpiresAt = %v, want a time in the future", got.ExpiresAt)
	}
}

func TestCanAccessCard(t *testing.T) {
	app := newTestApp(t)
	collection, err := app.FindCollectionByNameOrId("cards")
	if err != nil {
		t.Fatalf("find cards collection: %v", err)
	}
	live := core.NewRecord(collection)
	deleted := core.NewRecord(collection)
	deleted.Set("deleted", types.NowDateTime())
	for _, record := range []*core.Record{live, deleted} {
		if err := app.Save(record); err != nil {
			t.Fatalf("save card: %v", err)
		}
	}

	if err := CanAccessCard(app, "user", live.Id); err != nil {
		t.Errorf("live card: err = %v, want nil", err)
	}
	if err := CanAccessCard(app, "user", deleted.Id); !errors.Is(err, ErrCardNotFound) {
		t.Errorf("deleted card: err = %v, want ErrCardNotFound", err)
	}
	if err := CanAccessCard(app, "user", "missing"); !errors.Is(err, ErrCardNotFound) {
		t.Errorf("missing card: err = %v, want ErrCardNotFound", err)
	}
}
