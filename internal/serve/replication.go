// replication.go implements the pull side of the cards replication
// protocol that the frontend's Dexie database uses to fill its local
// copy (see docs/dexie-offline-sync.md). Only reads happen here:
// writes still go straight through PocketBase's own REST API.
package serve

import (
	"errors"
	"fmt"
	"net/http"
	"net/url"
	"strconv"

	"github.com/pocketbase/dbx"
	"github.com/pocketbase/pocketbase/core"
)

const (
	// defaultPullLimit is used when the client sends no "limit".
	defaultPullLimit = 200
	// maxPullLimit caps "limit". It must stay >= the frontend's Dexie
	// batch size: a page shorter than that tells Dexie there is
	// nothing left to pull.
	maxPullLimit = 1000
)

// cardCheckpoint is the position a pull continues after. Both fields are
// needed because several cards can share one "updated" value; the id
// breaks that tie.
type cardCheckpoint struct {
	UpdatedAt string // the card's "updated" value, exactly as PocketBase returned it
	ID        string
}

// parsePullQuery reads the checkpoint and limit of a pull request. A nil
// checkpoint means "from the beginning".
func parsePullQuery(q url.Values) (*cardCheckpoint, int, error) {
	limit := defaultPullLimit
	if raw := q.Get("limit"); raw != "" {
		n, err := strconv.Atoi(raw)
		if err != nil || n < 1 || n > maxPullLimit {
			return nil, 0, fmt.Errorf("limit must be an integer between 1 and %d", maxPullLimit)
		}
		limit = n
	}

	updatedAt, id := q.Get("updatedAt"), q.Get("id")
	if (updatedAt == "") != (id == "") {
		return nil, 0, errors.New("updatedAt and id must be given together")
	}
	if updatedAt == "" {
		return nil, limit, nil
	}
	return &cardCheckpoint{UpdatedAt: updatedAt, ID: id}, limit, nil
}

// pullCards returns the cards of a pot that changed after the checkpoint,
// oldest first, at most limit of them. Soft-deleted cards are included on
// purpose: the local replica needs them as deletion events.
func pullCards(app core.App, potID string, after *cardCheckpoint, limit int) ([]*core.Record, error) {
	filter := "pot = {:pot}"
	params := dbx.Params{"pot": potID}
	if after != nil {
		filter += " && (updated > {:updatedAt} || (updated = {:updatedAt} && id > {:id}))"
		params["updatedAt"] = after.UpdatedAt
		params["id"] = after.ID
	}
	return app.FindRecordsByFilter("cards", filter, "updated,id", limit, 0, params)
}

// pullCardsHandler serves GET /api/pages/{potId}/cards/pull.
func pullCardsHandler(e *core.RequestEvent) error {
	after, limit, err := parsePullQuery(e.Request.URL.Query())
	if err != nil {
		return e.BadRequestError(err.Error(), nil)
	}

	records, err := pullCards(e.App, e.Request.PathValue("potId"), after, limit)
	if err != nil {
		return e.InternalServerError("pull cards", err)
	}
	if records == nil {
		records = []*core.Record{} // encode "no changes" as [], not null
	}
	return e.JSON(http.StatusOK, map[string]any{"records": records})
}
