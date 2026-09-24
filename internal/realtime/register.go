package realtime

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"log/slog"
	"time"

	"github.com/centrifugal/centrifuge"
	"github.com/pocketbase/pocketbase/apis"
	"github.com/pocketbase/pocketbase/core"
)

// shutdownTimeout bounds how long Terminate waits for the node to close its
// connections, mirroring the yjs server's own shutdown in serve/ydoc.go.
const shutdownTimeout = 10 * time.Second

// Register starts the hub, mounts its WebSocket endpoint and publishes every
// "cards" change to that card's pot channel. It is meant to be called once
// from the server's OnServe hook.
func Register(e *core.ServeEvent) error {
	hub, err := New(e.App)
	if err != nil {
		return fmt.Errorf("start realtime hub: %w", err)
	}
	hub.BindCardHooks(e.App)

	e.Router.GET("/connection/websocket",
		apis.WrapStdHandler(centrifuge.NewWebsocketHandler(hub.node, centrifuge.WebsocketConfig{})))

	e.App.OnTerminate().BindFunc(func(te *core.TerminateEvent) error {
		ctx, cancel := context.WithTimeout(context.Background(), shutdownTimeout)
		defer cancel()
		if err := hub.node.Shutdown(ctx); err != nil {
			slog.Warn("realtime hub shutdown", "error", err)
		}
		return te.Next()
	})
	return nil
}

// authenticate accepts only a valid PocketBase superuser token: every
// collection in this app is superuser-only, so realtime must be too.
func authenticate(app core.App, token string) (userID string, err error) {
	record, err := app.FindAuthRecordByToken(token, core.TokenTypeAuth)
	if err != nil {
		return "", errors.New("invalid or expired auth token")
	}
	if !record.IsSuperuser() {
		return "", errors.New("realtime requires a superuser")
	}
	return record.Id, nil
}

// BindCardHooks publishes an event for every successful create, update and
// delete of a "cards" record.
func (h *Hub) BindCardHooks(app core.App) {
	app.OnRecordAfterCreateSuccess("cards").BindFunc(h.cardHook("create"))
	app.OnRecordAfterUpdateSuccess("cards").BindFunc(h.cardHook("update"))
	app.OnRecordAfterDeleteSuccess("cards").BindFunc(h.cardHook("delete"))
}

// cardHook publishes {action, record} -- the same shape PocketBase's own
// realtime sent -- to the record's pot channel. A publish failure is only
// logged: it must never fail the save that already succeeded.
func (h *Hub) cardHook(action string) func(*core.RecordEvent) error {
	return func(e *core.RecordEvent) error {
		if err := e.Next(); err != nil {
			return err
		}
		data, err := json.Marshal(map[string]any{"action": action, "record": e.Record})
		if err == nil {
			err = h.publish(CardsChannel(e.Record.GetString("pot")), data)
		}
		if err != nil {
			slog.Warn("publish card event", "action", action, "card", e.Record.Id, "error", err)
		}
		return nil
	}
}
