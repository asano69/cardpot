// card_views.go records who opened which card. A view is counted when a
// user's Yjs websocket connection is accepted (see yjs_auth.go), so cards
// opened while offline are not recorded.
//
// Each (card, user) pair has one row in "card_views": how many times the
// user opened the card and when they last did. The collection is not listed
// in internal/replica on purpose: updating it must never reach the realtime
// channels or the clients' pull.
//
// Every counted view is also written to PocketBase's own log (see
// app.Logger), which keeps the raw "who, when, which card" history until
// its retention period expires.
package serve

import (
	"database/sql"
	"errors"
	"log/slog"
	"sync"
	"time"

	"github.com/pocketbase/dbx"
	"github.com/pocketbase/pocketbase/core"
	"github.com/pocketbase/pocketbase/tools/types"
)

// viewDedupeWindow is how long after a counted view the same user opening
// the same card is not counted again. A websocket reconnect (network loss,
// token refresh) would otherwise count as a new view.
const viewDedupeWindow = 30 * time.Minute

// viewTracker remembers when each (user, card) pair was last counted. It
// only grows with the number of distinct pairs, which is small for this app.
type viewTracker struct {
	mu   sync.Mutex
	last map[string]time.Time
}

func newViewTracker() *viewTracker {
	return &viewTracker{last: make(map[string]time.Time)}
}

// shouldRecord reports whether a view at `now` is a new one, and remembers it
// if so.
func (t *viewTracker) shouldRecord(userID, cardID string, now time.Time) bool {
	key := userID + "/" + cardID

	t.mu.Lock()
	defer t.mu.Unlock()
	if prev, ok := t.last[key]; ok && now.Sub(prev) < viewDedupeWindow {
		return false
	}
	t.last[key] = now
	return true
}

// views is the single tracker shared by every connection, like
// titleWatcherInstance.
var views = newViewTracker()

// recordCardView counts a view of cardID by userID unless the same user
// already opened it recently. The database write runs in its own goroutine,
// so the websocket upgrade never waits for it. A failure is only logged: it
// must never affect opening the card.
func recordCardView(app core.App, userID, cardID string) {
	if !views.shouldRecord(userID, cardID, time.Now()) {
		return
	}
	app.Logger().Info("card view", "user", userID, "card", cardID)
	go func() {
		if err := upsertCardView(app, userID, cardID); err != nil {
			slog.Warn("record card view", "user", userID, "card", cardID, "error", err)
		}
	}()
}

// upsertCardView adds one view to the (card, user) row, creating it on the
// first view.
func upsertCardView(app core.App, userID, cardID string) error {
	record, err := app.FindFirstRecordByFilter(
		"card_views", "card = {:card} && user = {:user}",
		dbx.Params{"card": cardID, "user": userID},
	)
	if errors.Is(err, sql.ErrNoRows) {
		collection, err := app.FindCollectionByNameOrId("card_views")
		if err != nil {
			return err
		}
		record = core.NewRecord(collection)
		record.Set("card", cardID)
		record.Set("user", userID)
	} else if err != nil {
		return err
	}

	record.Set("count", record.GetInt("count")+1)
	record.Set("viewed", types.NowDateTime())
	return app.Save(record)
}
