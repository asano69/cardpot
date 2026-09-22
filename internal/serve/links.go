// links.go implements the /api/pages/{pot}/{slug}/links1hop route: the
// cards one wiki-link hop away from a given card, merging every card it
// links to (that actually exists) with every card that links to it. Each
// entry also carries its own outgoing target_titleLc list, so the
// frontend can render Scrapbox-style 2-hop links without a second round
// trip.
package serve

import (
	"database/sql"
	"errors"
	"net/http"
	"sort"

	"github.com/pocketbase/dbx"
	"github.com/pocketbase/pocketbase/core"

	"github.com/asano69/cardpot/internal/slug"
)

// linkedCard is one entry in the links1hop response.
type linkedCard struct {
	Title         string   `json:"title"`
	TitleLc       string   `json:"titleLc"`
	Description   string   `json:"description"`
	TargetTitleLc []string `json:"target_titleLc"`
}

func links1HopHandler(e *core.RequestEvent) error {
	potName := e.Request.PathValue("pot")
	requestedSlug := e.Request.PathValue("slug")

	pot, err := e.App.FindFirstRecordByFilter(
		"pots", "name = {:name}", dbx.Params{"name": potName},
	)
	if errors.Is(err, sql.ErrNoRows) {
		return e.NotFoundError("pot not found", nil)
	}
	if err != nil {
		return e.InternalServerError("find pot", err)
	}

	card, err := findCardBySlug(e.App, pot.Id, requestedSlug)
	if err != nil {
		return e.InternalServerError("find card", err)
	}
	if card == nil {
		return e.NotFoundError("card not found", nil)
	}

	result, err := links1Hop(e.App, pot.Id, card.GetString("titleLc"), card.Id)
	if err != nil {
		return e.InternalServerError("compute links1hop", err)
	}
	return e.JSON(http.StatusOK, map[string]any{"links1hop": result})
}

// findCardBySlug scans every card in pot for the one whose title slugifies
// (see internal/slug.FromTitle) to targetSlug. There is currently no stored
// slug field to look up directly, so this mirrors the frontend's own
// reverse lookup (CardForm.tsx's findCardByPotAndSlug). Returns (nil, nil)
// when no card matches.
func findCardBySlug(app core.App, potID, targetSlug string) (*core.Record, error) {
	candidates, err := app.FindRecordsByFilter(
		"cards", "pot = {:pot}", "", 0, 0, dbx.Params{"pot": potID},
	)
	if err != nil {
		return nil, err
	}
	for _, candidate := range candidates {
		if slug.FromTitle(candidate.GetString("title")) == targetSlug {
			return candidate, nil
		}
	}
	return nil, nil
}

// links1Hop merges cardID's outgoing wiki links (to cards that actually
// exist) with the cards that link to it, sorted by title for a stable
// response.
func links1Hop(app core.App, potID, titleLc, cardID string) ([]linkedCard, error) {
	outgoing, err := app.FindRecordsByFilter(
		"card_links", "source = {:source}", "", 0, 0,
		dbx.Params{"source": cardID},
	)
	if err != nil {
		return nil, err
	}

	incoming, err := app.FindRecordsByFilter(
		"card_links", "target_pot = {:pot} && target_titleLc = {:titleLc}", "", 0, 0,
		dbx.Params{"pot": potID, "titleLc": titleLc},
	)
	if err != nil {
		return nil, err
	}

	merged := make(map[string]*core.Record)
	for _, link := range outgoing {
		target, err := app.FindFirstRecordByFilter(
			"cards", "pot = {:pot} && titleLc = {:titleLc}",
			dbx.Params{"pot": potID, "titleLc": link.GetString("target_titleLc")},
		)
		if errors.Is(err, sql.ErrNoRows) {
			continue // linked page doesn't exist yet -- not a "substantial" card
		}
		if err != nil {
			return nil, err
		}
		merged[target.Id] = target
	}
	for _, link := range incoming {
		source, err := app.FindRecordById("cards", link.GetString("source"))
		if err != nil {
			continue // source deleted concurrently -- skip rather than fail the whole request
		}
		merged[source.Id] = source
	}

	result := make([]linkedCard, 0, len(merged))
	for _, related := range merged {
		targets, err := ownTargetTitleLcs(app, related.Id)
		if err != nil {
			return nil, err
		}
		result = append(result, linkedCard{
			Title:         related.GetString("title"),
			TitleLc:       related.GetString("titleLc"),
			Description:   related.GetString("description"),
			TargetTitleLc: targets,
		})
	}
	sort.Slice(result, func(i, j int) bool { return result[i].Title < result[j].Title })
	return result, nil
}

// ownTargetTitleLcs returns every target_titleLc a card links to as a
// source -- its own one-hop-out neighborhood.
func ownTargetTitleLcs(app core.App, cardID string) ([]string, error) {
	links, err := app.FindRecordsByFilter(
		"card_links", "source = {:source}", "", 0, 0,
		dbx.Params{"source": cardID},
	)
	if err != nil {
		return nil, err
	}
	targets := make([]string, 0, len(links))
	for _, link := range links {
		targets = append(targets, link.GetString("target_titleLc"))
	}
	return targets, nil
}
