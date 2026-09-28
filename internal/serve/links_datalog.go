// links_datalog.go implements the /api/pages/{pot}/{slug}/links1hop and
// /links2hop routes. The set of related cards is computed by the Datalog
// engine (see internal/datalog) instead of SQL joins.
package serve

import (
	"database/sql"
	"errors"
	"net/http"
	"sort"

	"github.com/pocketbase/dbx"
	"github.com/pocketbase/pocketbase/core"
)

// relatedCardsHandler answers with the cards whose ids query returns for the
// requested card, under the JSON key "key". The response entries have the
// same shape as links1HopHandler's.
func relatedCardsHandler(key string, query func(cardID string) ([]string, error)) func(*core.RequestEvent) error {
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

		ids, err := query(card.Id)
		if err != nil {
			return e.InternalServerError("compute "+key, err)
		}

		result := make([]linkedCard, 0, len(ids))
		for _, id := range ids {
			related, err := e.App.FindRecordById("cards", id)
			if err != nil || isDeleted(related) {
				continue // removed or soft-deleted since the engine was loaded
			}
			targets, err := ownTargetTitleLcs(e.App, related.Id)
			if err != nil {
				return e.InternalServerError("find link targets", err)
			}
			result = append(result, linkedCard{
				Title:         related.GetString("title"),
				TitleLc:       related.GetString("titleLc"),
				Description:   related.GetString("description"),
				TargetTitleLc: targets,
			})
		}
		sort.Slice(result, func(i, j int) bool { return result[i].Title < result[j].Title })
		return e.JSON(http.StatusOK, map[string]any{key: result})
	}
}
