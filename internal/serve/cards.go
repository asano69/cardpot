// cards.go implements the custom API route a client uses to create a
// brand-new draft card (which needs a real record id before Yjs sync can
// start). Renaming an existing card is not done here: the server resolves
// the title from the room's live text (see title_watch.go), which also
// announces a duplicate title to clients. A card's URL segment is not a
// separate field resolved here -- it's derived from the title on demand
// (see internal/slug.FromTitle and lib/slugify.ts).
package serve

import (
	"fmt"
	"net/http"

	"github.com/pocketbase/dbx"
	"github.com/pocketbase/pocketbase/core"

	"github.com/asano69/cardpot/internal/api"
	"github.com/asano69/cardpot/internal/slug"
)

// positionStep matches the frontend's own POSITION_STEP (see
// frontend/src/lib/position.ts): a new card starts POSITION_STEP past
// its pot's current highest position, so it sorts first in
// CardList's descending grid without needing a full renumber later.
const positionStep = 1000

// maxTitleRetries bounds how many times a create/update retries after
// a database-level unique constraint violation on (pot, title) -- the
// final defense against a TOCTOU race between resolveTitle's existence
// check and the actual save (see slug.go).
const maxTitleRetries = 3

// notDeleted is the filter clause that hides soft-deleted cards. A card
// is deleted by setting its "deleted" date, never by removing the record,
// so every lookup that must not see deleted cards adds this clause.
const notDeleted = `deleted = ""`

// nextCardPosition returns the position for a new card in `pot`.
func nextCardPosition(app core.App, pot string) (float64, error) {
	records, err := app.FindRecordsByFilter(
		"cards", "pot = {:pot}", "-position", 1, 0,
		dbx.Params{"pot": pot},
	)
	if err != nil {
		return 0, err
	}
	if len(records) == 0 {
		return positionStep, nil
	}
	return records[0].GetFloat("position") + positionStep, nil
}

// createCardHandler creates a new "cards" record with a title resolved
// from the client-supplied candidate (falling back to "Untitled" when
// the candidate is empty -- see resolveTitle). Used by the note
// editor's draft mode (see
// frontend/src/components/noteEditor/index.tsx), which needs a real
// record id before Yjs sync can start.
func createCardHandler(e *core.RequestEvent) error {
	var req api.CreateCardRequest
	if err := e.BindBody(&req); err != nil {
		return e.BadRequestError("invalid request body", err)
	}
	if req.Pot == "" {
		return e.BadRequestError("pot is required", nil)
	}

	collection, err := e.App.FindCollectionByNameOrId("cards")
	if err != nil {
		return e.InternalServerError("load cards collection", err)
	}

	position, err := nextCardPosition(e.App, req.Pot)
	if err != nil {
		return e.InternalServerError("compute card position", err)
	}

	candidate := req.TitleCandidate
	for attempt := 0; attempt < maxTitleRetries; attempt++ {
		title, err := resolveTitle(e.App, req.Pot, candidate, "")
		if err != nil {
			return e.InternalServerError("resolve title", err)
		}

		record := core.NewRecord(collection)
		record.Set("pot", req.Pot)
		record.Set("title", string(title))
		// A case-insensitive search key, kept in sync with title on
		// every save since PocketBase has no generated columns (see
		// internal/slug.ToLowerKey's own comment). This is what
		// actually enforces one card per URL segment now -- the URL
		// segment itself is derived from title on demand (see
		// internal/slug.FromTitle) rather than stored.
		record.Set("titleLc", slug.ToLowerKey(string(title)))
		record.Set("position", position)
		if err := e.App.Save(record); err != nil {
			if attempt < maxTitleRetries-1 {
				// A concurrent request may have taken this title between
				// resolveTitle's check and this save (TOCTOU) -- bump
				// the candidate and retry rather than failing outright.
				candidate = TitleCandidate(fmt.Sprintf("%s_%d", req.TitleCandidate, attempt+2))
				continue
			}
			return e.InternalServerError("save card", err)
		}
		return e.JSON(http.StatusOK, map[string]any{"card": record})
	}
	return e.InternalServerError("failed to create card after retries", nil)
}

