// links_datalog.go implements the /api/pages/{pot}/{slug}/links1hop and
// /links2hop routes. The set of related cards is computed by the Datalog
// engine (see internal/datalog) instead of SQL joins.
package serve

import (
	"database/sql"
	"errors"
	"net/http"
	"sort"
	"strings"

	"github.com/pocketbase/dbx"
	"github.com/pocketbase/pocketbase/core"
)

// cardQueryHandler serves GET /api/admin/cards/{id}/related: it runs the
// datalog query saved in the card's "query" field and answers with the live
// cards it returns, highest position first (the order of the card grid). A
// card without a query has no related cards.
func cardQueryHandler(run func(text string) ([]string, error)) func(*core.RequestEvent) error {
	return func(e *core.RequestEvent) error {
		card, err := e.App.FindRecordById("cards", e.Request.PathValue("id"))
		if err != nil {
			return e.NotFoundError("card not found", err)
		}

		cards := []*core.Record{}
		if text := strings.TrimSpace(card.GetString("query")); text != "" {
			ids, err := run(text)
			if err != nil {
				return e.BadRequestError("the card's query failed: "+err.Error(), err)
			}
			found, err := e.App.FindRecordsByIds("cards", ids)
			if err != nil {
				return e.InternalServerError("find related cards", err)
			}
			for _, related := range found {
				if !isDeleted(related) {
					cards = append(cards, related)
				}
			}
			sort.Slice(cards, func(i, j int) bool {
				return cards[i].GetFloat("position") > cards[j].GetFloat("position")
			})
		}
		return e.JSON(http.StatusOK, map[string]any{"cards": cards})
	}
}

// relatedCardsHandler answers with the cards whose ids query returns for the
// requested card, under the JSON key "key".
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
