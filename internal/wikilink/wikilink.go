// Package wikilink keeps the "card_links" collection in sync with the
// [wiki links] found in each card's text, so 1-hop and 2-hop link views
// can be answered from the database instead of re-parsing every card.
//
// A link row stores its target only as text (target_title and target_slug,
// mirroring the "cards" fields of the same names). The target card may not
// exist yet, may be renamed, or may be created later, so a link never needs
// to know whether its target exists. Its identity is the target_slug -- the
// same key the frontend uses to resolve a title to a card -- and a target is
// matched to a card only at query time, by (pot, slug).
package wikilink

import (
	"database/sql"
	"errors"

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
// a self link depends on the card's current slug, which can change without
// Sync running again, so it is left to whoever queries the links.
func Sync(app core.App, cardID, text string) error {
	_, err := app.FindRecordById("cards", cardID)
	if errors.Is(err, sql.ErrNoRows) {
		return nil // card deleted concurrently
	}
	if err != nil {
		return err
	}

	targets := targetTitles(parser.Parse(text).WikiLinkTitles())

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
		for _, targetSlug := range missing {
			record := core.NewRecord(collection)
			record.Set("source", cardID)
			record.Set("target_slug", targetSlug)
			record.Set("target_title", targets[targetSlug])
			if err := tx.Save(record); err != nil {
				return err
			}
		}
		return nil
	})
}

// targetTitles maps each linked slug to the raw title under which it was
// first linked. Links are the same when their slugs are (see
// slug.FromTitle), matching how the frontend resolves a title to a card.
// Titles that derive an empty slug (e.g. a link made only of brackets and
// spaces) cannot be stored and are dropped.
func targetTitles(titles []string) map[string]string {
	titleBySlug := make(map[string]string, len(titles))
	for _, title := range titles {
		s := slug.FromTitle(title)
		if s == "" {
			continue
		}
		if _, seen := titleBySlug[s]; !seen {
			titleBySlug[s] = title
		}
	}
	return titleBySlug
}

// diff compares the stored rows with the wanted targets (keyed by slug).
// stale rows (a link that is gone, or a duplicate row) must be deleted;
// missing slugs need a new row. The stored target_title of a kept row is left
// as is: the row's identity is its slug, so a different spelling of the same
// slug is not a change.
func diff(existing []*core.Record, targets map[string]string) (stale []*core.Record, missing []string) {
	kept := make(map[string]bool, len(existing))
	for _, record := range existing {
		targetSlug := record.GetString("target_slug")
		if _, wanted := targets[targetSlug]; wanted && !kept[targetSlug] {
			kept[targetSlug] = true
			continue
		}
		stale = append(stale, record)
	}
	for targetSlug := range targets {
		if !kept[targetSlug] {
			missing = append(missing, targetSlug)
		}
	}
	return stale, missing
}
