// Package wikilink keeps the "card_links" collection in sync with the
// [wiki links] found in each card's text, so 1-hop and 2-hop link views
// can be answered from the database instead of re-parsing every card.
//
// A link row stores its target as a card id, so renaming the target card
// never touches card_links. Links to titles that match no card in the
// same pot are not stored (yet).
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
// created, all in one transaction. When nothing changed, nothing is
// written. A card that no longer exists is ignored.
func Sync(app core.App, cardID, text string) error {
	card, err := app.FindRecordById("cards", cardID)
	if errors.Is(err, sql.ErrNoRows) {
		return nil // card deleted concurrently
	}
	if err != nil {
		return err
	}

	targets, err := resolveTargets(app, card.GetString("pot"), cardID, parser.Parse(text).WikiLinkTitles())
	if err != nil {
		return err
	}

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
		for _, target := range missing {
			record := core.NewRecord(collection)
			record.Set("source", cardID)
			record.Set("target", target)
			// Required by the schema; only a placeholder for now (it is
			// not used to decide what changed).
			record.Set("target_title", targets[target])
			if err := tx.Save(record); err != nil {
				return err
			}
		}
		return nil
	})
}

// resolveTargets maps each linked card id to the raw title under which it
// was first linked. Links are the same when their slugs are (see
// slug.FromTitle), matching how the frontend resolves a title to a card.
// Links to the card itself and to titles with no card in the pot are
// dropped.
func resolveTargets(app core.App, pot, sourceID string, titles []string) (map[string]string, error) {
	titleBySlug := make(map[string]string, len(titles))
	for _, title := range titles {
		s := slug.FromTitle(title)
		if _, seen := titleBySlug[s]; !seen {
			titleBySlug[s] = title
		}
	}
	if len(titleBySlug) == 0 {
		return nil, nil
	}

	slugs := make([]any, 0, len(titleBySlug))
	for s := range titleBySlug {
		slugs = append(slugs, s)
	}
	var cards []*core.Record
	err := app.RecordQuery("cards").
		AndWhere(dbx.HashExp{"pot": pot}).
		AndWhere(dbx.In("slug", slugs...)).
		All(&cards)
	if err != nil {
		return nil, err
	}

	targets := make(map[string]string, len(cards))
	for _, card := range cards {
		if card.Id == sourceID {
			continue
		}
		targets[card.Id] = titleBySlug[card.GetString("slug")]
	}
	return targets, nil
}

// diff compares the stored rows with the wanted targets. stale rows (a link
// that is gone, or a duplicate row) must be deleted; missing targets need a
// new row.
func diff(existing []*core.Record, targets map[string]string) (stale []*core.Record, missing []string) {
	kept := make(map[string]bool, len(existing))
	for _, record := range existing {
		target := record.GetString("target")
		if _, wanted := targets[target]; wanted && !kept[target] {
			kept[target] = true
			continue
		}
		stale = append(stale, record)
	}
	for target := range targets {
		if !kept[target] {
			missing = append(missing, target)
		}
	}
	return stale, missing
}
