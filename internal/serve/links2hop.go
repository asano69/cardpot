// links2hop.go implements /api/pages/{pot}/{slug}/links2hop. Unlike
// links1hop, the result is computed by the Datalog engine (see
// internal/datalog) instead of SQL joins.
package serve

import (
	"database/sql"
	"errors"
	"net/http"
	"sort"

	"github.com/pocketbase/dbx"
	"github.com/pocketbase/pocketbase/core"

	"github.com/asano69/cardpot/internal/datalog"
)

type links2HopCard struct {
	Title       string `json:"title"`
	TitleLc     string `json:"titleLc"`
	Description string `json:"description"`
}

func links2HopHandler(engine *datalog.Engine) func(*core.RequestEvent) error {
	return func(e *core.RequestEvent) error {
		pot, err := e.App.FindFirstRecordByFilter(
			"pots", "name = {:name}", dbx.Params{"name": e.Request.PathValue("pot")},
		)
		if errors.Is(err, sql.ErrNoRows) {
			return e.NotFoundError("pot not found", nil)
		}
		if err != nil {
			return e.InternalServerError("find pot", err)
		}

		card, err := findCardBySlug(e.App, pot.Id, e.Request.PathValue("slug"))
		if err != nil {
			return e.InternalServerError("find card", err)
		}
		if card == nil {
			return e.NotFoundError("card not found", nil)
		}

		ids, err := engine.Links2Hop(card.Id)
		if err != nil {
			return e.InternalServerError("compute links2hop", err)
		}

		result := make([]links2HopCard, 0, len(ids))
		for _, id := range ids {
			related, err := e.App.FindRecordById("cards", id)
			if err != nil || isDeleted(related) {
				continue // removed or soft-deleted since the engine was loaded
			}
			result = append(result, links2HopCard{
				Title:       related.GetString("title"),
				TitleLc:     related.GetString("titleLc"),
				Description: related.GetString("description"),
			})
		}
		sort.Slice(result, func(i, j int) bool { return result[i].Title < result[j].Title })
		return e.JSON(http.StatusOK, map[string]any{"links2hop": result})
	}
}
