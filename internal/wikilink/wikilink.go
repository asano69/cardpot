// Package wikilink keeps the "card_links" collection in sync with the
// [wiki links] found in each card's text, so 1-hop and 2-hop link views
// can be answered from the database instead of re-parsing every card.
//
// A link row stores its target only as text (target_title and
// target_titleLc, mirroring the "cards" fields of the same names). The
// target card may not exist yet, may be renamed, or may be created later,
// so a link never needs to know whether its target exists. Its identity is
// target_titleLc -- the same case-insensitive key "cards" itself uses to
// enforce title uniqueness (see internal/serve/slug.go's
// resolveUniqueTitleInPot) -- and a target is matched to a card only at
// query time, by (pot, titleLc).
package wikilink

import (
	"database/sql"
	"errors"
	"strings"

	"github.com/pocketbase/dbx"
	"github.com/pocketbase/pocketbase/core"

	"github.com/asano69/cardpot/internal/parser"
	"github.com/asano69/cardpot/internal/slug"
)

// Sync makes card_links match the wiki links in text for the card cardID:
// rows for links that disappeared are deleted and rows for new links are
// created, all in one transaction. When nothing changed, nothing is written.
// A card that no longer exists is ignored.
//
// Every link is stored, including links to the card itself: whether that is
// a self link depends on the card's current titleLc, which can change
// without Sync running again, so it is left to whoever queries the links.
func Sync(app core.App, cardID, text string) error {
	source, err := app.FindRecordById("cards", cardID)
	if errors.Is(err, sql.ErrNoRows) {
		return nil // card deleted concurrently
	}
	if err != nil {
		return err
	}
	pot := source.GetString("pot")

	targets := targetTitlesByTitleLc(parser.Parse(text).WikiLinkTitles())

	existing, err := app.FindRecordsByFilter(
		"card_links", "source = {:source}", "", 0, 0,
		dbx.Params{"source": cardID},
	)
	if err != nil {
		return err
	}

	stale, missing := diff(existing, targets)
	if len(stale) == 0 && len(missing) == 0 {
		return nil
	}

	collection, err := app.FindCollectionByNameOrId("card_links")
	if err != nil {
		return err
	}
	return app.RunInTransaction(func(tx core.App) error {
		for _, record := range stale {
			if err := tx.Delete(record); err != nil {
				return err
			}
		}
		for _, targetTitleLc := range missing {
			record := core.NewRecord(collection)
			record.Set("source", cardID)
			// A wiki link's target is resolved within the same pot as its
			// source card (see slug.go's resolveTitle), so this is stored
			// alongside target_titleLc to make the reverse lookup (which
			// cards link to a given card) possible without having to
			// re-derive the pot from the source card each time.
			record.Set("target_pot", pot)
			record.Set("target_titleLc", targetTitleLc)
			record.Set("target_title", targets[targetTitleLc])
			if err := tx.Save(record); err != nil {
				return err
			}
		}
		return nil
	})
}

// targetTitlesByTitleLc maps each linked title's titleLc identity (see
// internal/slug.ToLowerKey) to the raw title under which it was first
// linked. This is the same normalization resolveTitle applies to a card's
// own title before saving (see internal/serve/slug.go), so a wiki link's
// identity always matches how its target card would itself be identified.
// Titles that normalize to no usable text at all (e.g. a link made only of
// brackets and spaces) cannot be stored and are dropped.
func targetTitlesByTitleLc(titles []string) map[string]string {
	titleByTitleLc := make(map[string]string, len(titles))
	for _, title := range titles {
		base := title
		if strings.ContainsAny(base, "[]") {
			base = slug.StripBracketLinks(base)
		}
		if base == "" {
			continue
		}
		key := slug.ToLowerKey(base)
		if _, seen := titleByTitleLc[key]; !seen {
			titleByTitleLc[key] = title
		}
	}
	return titleByTitleLc
}

// diff compares the stored rows with the wanted targets (keyed by
// titleLc). stale rows (a link that is gone, or a duplicate row) must be
// deleted; missing keys need a new row. The stored target_title of a kept
// row is left as is: the row's identity is its titleLc, so a different
// spelling of the same titleLc is not a change.
func diff(existing []*core.Record, targets map[string]string) (stale []*core.Record, missing []string) {
	kept := make(map[string]bool, len(existing))
	for _, record := range existing {
		targetTitleLc := record.GetString("target_titleLc")
		if _, wanted := targets[targetTitleLc]; wanted && !kept[targetTitleLc] {
			kept[targetTitleLc] = true
			continue
		}
		stale = append(stale, record)
	}
	for targetTitleLc := range targets {
		if !kept[targetTitleLc] {
			missing = append(missing, targetTitleLc)
		}
	}
	return stale, missing
}
