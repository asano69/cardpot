// title_watch.go resolves a card's title purely from server-side
// observation of its live Yjs "content" text, debounced per room. This
// replaces the old client-driven flow where an existing card's editor
// (see frontend/src/components/noteEditor/ExistingCardEditor.tsx) had to
// itself notice a header edit and round-trip an HTTP request to resolve
// it. Resolving here instead means the title can never desync from what
// the room's document actually holds, and it now updates regardless of
// which peer -- or how many peers -- are editing the room.
package serve

import (
	"fmt"
	"log/slog"
	"sync"
	"time"

	"github.com/pocketbase/pocketbase/core"
	"github.com/reearth/ygo/crdt"

	"github.com/asano69/cardpot/internal/parser"
	"github.com/asano69/cardpot/internal/slug"
)

// titleWatchDebounce mirrors the frontend's own DEBOUNCE_MS
// (titleCandidatePlugin.ts): a burst of edits to the header only
// resolves once typing pauses, instead of writing to the DB on every
// keystroke.
const titleWatchDebounce = 500 * time.Millisecond

// titleWatcher owns one debounce timer per room, plus the last raw
// header text seen for that room so an edit elsewhere in the document
// (header unaffected) never triggers a needless resolve.
type titleWatcher struct {
	mu      sync.Mutex
	timers  map[string]*time.Timer
	lastRaw map[string]string

	// notify reports a card's duplicate title to clients: mergeTarget is
	// the title it duplicates, or "" when it no longer does. Set once at
	// startup (see registerRoutes), before any room can be loaded; nil
	// disables the report.
	notify func(cardID, mergeTarget string) error
}

func newTitleWatcher() *titleWatcher {
	return &titleWatcher{
		timers:  make(map[string]*time.Timer),
		lastRaw: make(map[string]string),
	}
}

// titleWatcherInstance is the single watcher shared by every room,
// mirroring yjsServer's own package-level singleton (see ydoc.go).
var titleWatcherInstance = newTitleWatcher()

// observe registers a debounced title resolver on room's live
// "content" YText. Called once per room from OnLoadDocument (see
// ydoc.go), so it fires for any peer's edit -- not just whoever
// happened to open the connection first.
func (w *titleWatcher) observe(app core.App, room string, doc *crdt.Doc) {
	text := doc.GetText("content")

	w.mu.Lock()
	w.lastRaw[room] = parser.Parse(text.ToString()).Title()
	w.mu.Unlock()

	text.Observe(func(_ crdt.YTextEvent) {
		raw := parser.Parse(text.ToString()).Title()

		w.mu.Lock()
		if w.lastRaw[room] == raw {
			w.mu.Unlock()
			return
		}
		w.lastRaw[room] = raw
		if t, ok := w.timers[room]; ok {
			t.Stop()
		}
		w.timers[room] = time.AfterFunc(titleWatchDebounce, func() {
			w.resolve(app, room, raw)
		})
		w.mu.Unlock()
	})
}

// resolve persists the title resolved from raw, retrying through the
// same numeric-suffix bump as cards.go's own
// createCardHandler/updateCardTitleHandler if a concurrent save takes
// the candidate title between resolveTitle's check and this save
// (TOCTOU) -- maxTitleRetries is defined once in cards.go and shared
// here.
func (w *titleWatcher) resolve(app core.App, room, raw string) {
	record, err := app.FindRecordById("cards", room)
	if err != nil {
		return // card deleted concurrently -- nothing to update
	}
	pot := record.GetString("pot")

	candidate := TitleCandidate(raw)
	for attempt := 0; attempt < maxTitleRetries; attempt++ {
		title, err := resolveTitle(app, pot, candidate, room)
		if err != nil {
			slog.Warn("resolve title", "room", room, "error", err)
			return
		}
		// An unchanged title is not written again: avoid a no-op write and
		// its "updated" bump.
		if record.GetString("title") != string(title) {
			record.Set("title", string(title))
			// See cards.go's own comment on titleLc: this is what actually
			// enforces uniqueness now. The URL segment is derived from
			// title on demand (see internal/slug.FromTitle) instead of
			// being stored.
			record.Set("titleLc", slug.ToLowerKey(string(title)))
			if err := app.Save(record); err != nil {
				if attempt < maxTitleRetries-1 {
					candidate = TitleCandidate(fmt.Sprintf("%s_%d", raw, attempt+2))
					continue
				}
				slog.Warn("save resolved title", "room", room, "error", err)
				return
			}
		}
		// Reported even when the title did not change: a card created from
		// a draft already holds its disambiguated title by now.
		w.alert(app, pot, room, TitleCandidate(raw), title)
		return
	}
}

// alert tells clients whether the card's header collided with another
// card's title (see findMergeTarget). A card that does not collide is
// reported too, with an empty target, so a shown alert is cleared. A failure
// is only logged: it must never affect the title itself.
func (w *titleWatcher) alert(app core.App, pot, room string, raw TitleCandidate, title CardTitle) {
	if w.notify == nil {
		return
	}
	target, err := findMergeTarget(app, pot, raw, title, room)
	if err != nil {
		slog.Warn("find merge target", "room", room, "error", err)
		return
	}
	if err := w.notify(room, string(target)); err != nil {
		slog.Warn("notify merge target", "room", room, "error", err)
	}
}

// forget cancels room's pending debounce timer and drops its cached
// header, if any. Called from forgetRoom (see ydoc.go) so a deleted
// card never fires a stale resolution after the fact.
func (w *titleWatcher) forget(room string) {
	w.mu.Lock()
	defer w.mu.Unlock()
	if t, ok := w.timers[room]; ok {
		t.Stop()
		delete(w.timers, room)
	}
	delete(w.lastRaw, room)
}
