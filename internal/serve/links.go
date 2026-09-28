// links.go holds the helpers shared by the links1hop and links2hop routes
// (see links_datalog.go): resolving a card from its URL slug and listing the
// link targets of a card. The related cards themselves are computed by the
// Datalog engine (see internal/datalog).
package serve

import (
	"database/sql"
	"errors"
	"strings"

	"github.com/pocketbase/dbx"
	"github.com/pocketbase/pocketbase/core"

	"github.com/asano69/cardpot/internal/slug"
)

// linkedCard is one entry in the links1hop and links2hop responses.
type linkedCard struct {
	Title         string   `json:"title"`
	TitleLc       string   `json:"titleLc"`
	Description   string   `json:"description"`
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
