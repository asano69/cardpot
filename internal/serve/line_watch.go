// line_watch.go keeps a card's line ids in the "card_lines" collection, one
// record per card whose "lines" field is the ordered list of {id, hash} of
// its lines (see assignLineIDs). Like title_watch.go it observes the room's
// live text and runs debounced, so ids follow the text almost in real time
// instead of waiting for the periodic snapshot (see syncDerived).
package serve

import (
	"database/sql"
	"encoding/json"
	"errors"
	"fmt"
	"log/slog"
	"sync"
	"time"

	"github.com/pocketbase/dbx"
	"github.com/pocketbase/pocketbase/core"
	"github.com/pocketbase/pocketbase/tools/security"
	"github.com/pocketbase/pocketbase/tools/types"
	"github.com/reearth/ygo/crdt"
)

// lineWatchDebounce mirrors the frontend's own links debounce.
const lineWatchDebounce = 300 * time.Millisecond

func newLineID() string { return security.RandomString(12) }

// syncLines makes the stored line entries of a card match text, keeping the
// ids of unchanged lines. The read and the write share one transaction, and
// the unique index on "card" rejects a second record for the same card.
// Nothing is written when the entries did not change.
func syncLines(app core.App, cardID, text string) error {
	hashes := lineHashes(text)
	return app.RunInTransaction(func(tx core.App) error {
		record, err := tx.FindFirstRecordByFilter(
			"card_lines", "card = {:card}", dbx.Params{"card": cardID},
		)
		if errors.Is(err, sql.ErrNoRows) {
			collection, err := tx.FindCollectionByNameOrId("card_lines")
			if err != nil {
				return err
			}
			record = core.NewRecord(collection)
			record.Set("card", cardID)
		} else if err != nil {
			return err
		}

		var prev []lineEntry
		if raw := record.GetString("lines"); raw != "" {
			if err := json.Unmarshal([]byte(raw), &prev); err != nil {
				return fmt.Errorf("decode stored lines: %w", err)
			}
		}

		encoded, err := json.Marshal(assignLineIDs(prev, hashes, newLineID))
		if err != nil {
			return err
		}
		// GetString on a JSON field returns its raw JSON text.
		if record.GetString("lines") == string(encoded) {
			return nil
		}
		record.Set("lines", types.JSONRaw(encoded))
		return tx.Save(record)
	})
}

// lineWatcher owns one debounce timer per room.
type lineWatcher struct {
	mu     sync.Mutex
	timers map[string]*time.Timer
}

func newLineWatcher() *lineWatcher {
	return &lineWatcher{timers: make(map[string]*time.Timer)}
}

// lineWatcherInstance is the single watcher shared by every room, like
// titleWatcherInstance.
var lineWatcherInstance = newLineWatcher()

// observe schedules a line sync on every change of room's live text, and once
// right away so a card that has no entries yet gets them.
func (w *lineWatcher) observe(app core.App, room string, doc *crdt.Doc) {
	doc.GetText("content").Observe(func(_ crdt.YTextEvent) {
		w.schedule(app, room, doc)
	})
	w.schedule(app, room, doc)
}

func (w *lineWatcher) schedule(app core.App, room string, doc *crdt.Doc) {
	w.mu.Lock()
	defer w.mu.Unlock()
	if t, ok := w.timers[room]; ok {
		t.Stop()
	}
	w.timers[room] = time.AfterFunc(lineWatchDebounce, func() {
		// Read when the timer fires, so the latest text is used. A failure
		// is only logged: it must never affect editing.
		text := doc.GetText("content").ToString()
		if err := syncLines(app, room, text); err != nil {
			slog.Warn("sync card lines", "room", room, "error", err)
		}
	})
}

// forget cancels room's pending timer. Called from forgetRoom (see ydoc.go).
func (w *lineWatcher) forget(room string) {
	w.mu.Lock()
	defer w.mu.Unlock()
	if t, ok := w.timers[room]; ok {
		t.Stop()
		delete(w.timers, room)
	}
}
