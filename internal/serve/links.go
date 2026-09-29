// links.go implements the /api/pages/{pot}/{slug}/links1hop and /links2hop
// routes. The related cards are found with SQL over the "cards" and
// "card_links" collections, using the (pot, titleLc) index of "cards" and
// the (target_pot, target_titleLc) and (source) indexes of "card_links".
// Each route runs one query for the related cards and one for their link
// targets, however many cards it returns.
package serve

import (
	"database/sql"
	"errors"
	"net/http"
	"strings"

	"github.com/pocketbase/dbx"
	"github.com/pocketbase/pocketbase/core"
	"github.com/pocketbase/pocketbase/tools/types"

	"github.com/asano69/cardpot/internal/slug"
)

// linkedCard is one entry in the links1hop and links2hop responses. It holds
// everything the frontend's card grid needs to draw a card, so both routes
// share this one shape.
type linkedCard struct {
	Title         string   `json:"title"`
	TitleLc       string   `json:"titleLc"`
	// Raw JSON as stored in the "description" field (a list of lines), so it
	// reaches the client exactly like the cards collection's own responses.
	Description   types.JSONRaw `json:"description"`
	Image         string   `json:"image"`
	Pin           bool     `json:"pin"`
	TargetTitleLc []string `json:"target_titleLc"`
}

// findCardBySlug looks up the card in pot whose title slugifies (see
// internal/slug.FromTitle) to targetSlug, using the "cards" collection's
// existing (pot, titleLc) unique index instead of a full linear scan.
//
// titleLc is derived from title via internal/slug.ToLowerKey: lowercase,
// spaces replaced with underscores. Since a card's title can never contain
// "[" or "]" (see the "cards" collection's title field pattern), FromTitle's
// no-bracket branch performs that same space-to-underscore substitution, so
// strings.ToLower(targetSlug) is exactly the titleLc of any title that would
// slugify to targetSlug. Titles can also never be a reserved word (see
// internal/slug.IsReserved, enforced by validate.go's OnRecordValidate
// hook), so FromTitle's reserved-suffix branch never applies to a stored
// title and can be ignored here.
//
// The FromTitle comparison below is kept as a final check on the single
// matched candidate since titleLc is case-insensitive but targetSlug is not:
// it guards against a different-case title that happens to share the same
// titleLc. Returns (nil, nil) when no card matches.
func findCardBySlug(app core.App, potID, targetSlug string) (*core.Record, error) {
	candidateTitleLc := strings.ToLower(targetSlug)
	candidate, err := app.FindFirstRecordByFilter(
		"cards", "pot = {:pot} && titleLc = {:titleLc} && "+notDeleted,
		dbx.Params{"pot": potID, "titleLc": candidateTitleLc},
	)
	if errors.Is(err, sql.ErrNoRows) {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	if slug.FromTitle(candidate.GetString("title")) != targetSlug {
		return nil, nil
	}
	return candidate, nil
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

// relatedCardsHandler answers with the cards that find returns for the
// requested card, under the JSON key "key".
func relatedCardsHandler(key string, find func(core.App, *core.Record) ([]linkedCard, error)) func(*core.RequestEvent) error {
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

		result, err := find(e.App, card)
		if err != nil {
			return e.InternalServerError("compute "+key, err)
		}
		return e.JSON(http.StatusOK, map[string]any{key: result})
	}
}

// links1Hop returns the live cards one wiki-link hop away from card: the
// cards it links to (that actually exist) and the cards that link to it.
func links1Hop(app core.App, card *core.Record) ([]linkedCard, error) {
	return relatedCards(app, card, `cards.id IN (
		SELECT c.id FROM cards c
		JOIN card_links l ON l.target_pot = c.pot AND l.target_titleLc = c.titleLc
		WHERE l.source = {:id}
		UNION
		SELECT source FROM card_links
		WHERE target_pot = {:pot} AND target_titleLc = {:titleLc}
	)`)
}

// links2Hop returns the live cards of the same pot that link to at least one
// of the targets card links to (A --> X <-- B). X does not have to exist.
func links2Hop(app core.App, card *core.Record) ([]linkedCard, error) {
	return relatedCards(app, card, `cards.id IN (
		SELECT l2.source FROM card_links l1
		JOIN card_links l2
			ON l2.target_pot = l1.target_pot AND l2.target_titleLc = l1.target_titleLc
		WHERE l1.source = {:id}
	)`)
}

// relatedCards loads the live cards of card's pot, other than card itself,
// that match condition, sorted by title. condition may use the {:id},
// {:pot} and {:titleLc} parameters of card.
func relatedCards(app core.App, card *core.Record, condition string) ([]linkedCard, error) {
	var records []*core.Record
	err := app.RecordQuery("cards").
		AndWhere(dbx.NewExp(
			"cards.pot = {:pot} AND cards.deleted = '' AND cards.id != {:id} AND ("+condition+")",
			dbx.Params{
				"id":      card.Id,
				"pot":     card.GetString("pot"),
				"titleLc": card.GetString("titleLc"),
			},
		)).
		OrderBy("cards.title").
		All(&records)
	if err != nil {
		return nil, err
	}

	ids := make([]any, len(records))
	for i, record := range records {
		ids[i] = record.Id
	}
	targets, err := targetTitleLcsBySource(app, ids)
	if err != nil {
		return nil, err
	}

	result := make([]linkedCard, len(records))
	for i, record := range records {
		linkTargets := targets[record.Id]
		if linkTargets == nil {
			linkTargets = []string{}
		}
		result[i] = linkedCard{
			Title:         record.GetString("title"),
			TitleLc:       record.GetString("titleLc"),
			Description:   types.JSONRaw(record.GetString("description")),
			Image:         record.GetString("image"),
			Pin:           record.GetBool("pin"),
			TargetTitleLc: linkTargets,
		}
	}
	return result, nil
}

// targetTitleLcsBySource returns, for each of the given source card ids, the
// target_titleLc of every link it has, in one query.
func targetTitleLcsBySource(app core.App, ids []any) (map[string][]string, error) {
	targets := make(map[string][]string, len(ids))
	if len(ids) == 0 {
		return targets, nil
	}

	var rows []struct {
		Source        string `db:"source"`
		TargetTitleLc string `db:"target_titleLc"`
	}
	err := app.DB().
		Select("source", "target_titleLc").
		From("card_links").
		Where(dbx.In("source", ids...)).
		All(&rows)
	if err != nil {
		return nil, err
	}
	for _, row := range rows {
		targets[row.Source] = append(targets[row.Source], row.TargetTitleLc)
	}
	return targets, nil
}
