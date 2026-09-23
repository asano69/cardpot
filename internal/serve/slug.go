// Package serve: slug.go resolves a unique display "title" for a card
// from arbitrary candidate text (the card's header, or its first body
// line if the header is empty). This is deliberately separate from
// ydoc.go's Yjs persistence hook: title resolution reacts to an
// explicit client request (see the /api/admin/cards and
// /api/admin/cards/{id}/title routes in cards.go), not to every Yjs
// update, so there's no need to detect whether the header actually
// changed before recomputing it.
//
// A card's URL segment is no longer a separate stored field -- it's
// derived from this same title on demand (see internal/slug.FromTitle
// and its frontend mirror, frontend/src/lib/slugify.ts), since the
// (pot, title) unique index already guarantees a title never collides
// within a pot.
package serve

import (
	"database/sql"
	"errors"
	"fmt"
	"regexp"
	"strings"

	"github.com/pocketbase/dbx"
	"github.com/pocketbase/pocketbase/core"

	"github.com/asano69/cardpot/internal/slug"
)

// defaultTitle is used when a candidate resolves to no usable text at
// all -- e.g. an empty draft confirmed with Enter. Duplicate defaults
// are disambiguated the same way any other title is (see
// resolveUniqueTitleInPot).
const defaultTitle = "Untitled"

// resolveUniqueTitleInPot returns a value derived from base that is
// unique among "cards" records in pot -- unique on its DERIVED
// titleLc (see internal/slug.ToLowerKey), not on the raw title
// string. This matters because ToLowerKey is not injective: "a b"
// and "a_b" both normalize to "a_b" (case-insensitive, spaces mapped
// to underscores), so checking title equality alone would let two
// different titles land on the same URL segment (see
// internal/slug.FromTitle, which derives that segment from title on
// demand) and become indistinguishable by URL.
// excludeID lets a record keep resolving against its own current
// title without colliding with itself (pass "" for a brand-new
// record). Collisions are disambiguated with a numeric suffix ("_2",
// "_3", ...) appended to the title.
func resolveUniqueTitleInPot(app core.App, pot, base, excludeID string) (string, error) {
	value := base
	for suffix := 2; ; suffix++ {
		candidateTitleLc := slug.ToLowerKey(value)
		_, err := app.FindFirstRecordByFilter(
			"cards",
			"pot = {:pot} && id != {:id} && titleLc = {:titleLc}",
			dbx.Params{"pot": pot, "titleLc": candidateTitleLc, "id": excludeID},
		)
		if errors.Is(err, sql.ErrNoRows) {
			return value, nil
		}
		if err != nil {
			return "", err
		}
		value = fmt.Sprintf("%s_%d", base, suffix)
	}
}

// resolveTitle returns a title derived from candidate that is unique
// within pot, matching the "cards" collection's unique (pot, title)
// index. excludeID lets a card keep resolving against its own current
// title without colliding with itself.
//
// A candidate containing bracket-link markup ("[", "]") is treated as
// Scrapbox/Cosense-style word segmentation and normalized via
// slug.StripBracketLinks before becoming the title base -- e.g.
// "[D]" resolves to "D", not the literal "[D]". A candidate with no
// brackets at all is left completely untouched (see
// TestResolveTitle_PreservesCandidateWhitespaceVariants): only the
// presence of brackets triggers normalization, so plain whitespace
// variants are never altered.
func resolveTitle(app core.App, pot string, candidate TitleCandidate, excludeID string) (CardTitle, error) {
	value, err := resolveUniqueTitleInPot(app, pot, titleBase(candidate), excludeID)
	return CardTitle(value), err
}

// titleBase normalizes candidate into the title resolveTitle starts from,
// before any uniqueness suffix is applied. It is also what a caller must
// use to find the card a candidate would resolve to when no other card
// competes for it (see import.go).
func titleBase(candidate TitleCandidate) string {
	base := string(candidate)
	if strings.ContainsAny(base, "[]") {
		base = slug.StripBracketLinks(base)
	}
	if base == "" {
		base = defaultTitle
	}
	// A base that case-insensitively matches a reserved route segment (see
	// internal/slug.IsReserved) is disambiguated here, before the
	// uniqueness loop runs. Without this, such a title would only be
	// caught later by the "cards" collection's OnRecordValidate hook (see
	// validate.go), and that rejection made the retry loop in
	// createCardHandler/updateCardTitleHandler bump the title into
	// "..._2" instead of the properly disambiguated "..._".
	if slug.IsReserved(base) {
		base += "_"
	}
	return base
}

// titleSuffixRe matches the trailing numeric dedup suffix a title gets
// from resolveUniqueTitleInPot (e.g. "p_2" -> "p"). Only one level is
// stripped per call.
var titleSuffixRe = regexp.MustCompile(`^(.+)_\d+$`)

// stripTitleSuffix strips one level of the trailing numeric dedup
// suffix from title (see titleSuffixRe), or returns "" if title has no
// such suffix.
func stripTitleSuffix(title CardTitle) CardTitle {
	m := titleSuffixRe.FindStringSubmatch(string(title))
	if m == nil {
		return ""
	}
	return CardTitle(m[1])
}

// findMergeTarget returns the title this card would collide with if
// its own numeric dedup suffix were stripped (e.g. "p_2" -> "p"), but
// only when that collision looks like a genuine duplicate rather than
// two deliberately different headers that happen to share a stripped
// title: the other card's own header (its card_lines position-0 line)
// must match rawHeader once both are trimmed. Returns "" when no merge
// alert should be shown.
func findMergeTarget(app core.App, pot string, title CardTitle, rawHeader TitleCandidate, excludeID string) (CardTitle, error) {
	stripped := stripTitleSuffix(title)
	if stripped == "" {
		return "", nil
	}

	other, err := app.FindFirstRecordByFilter(
		"cards",
		"pot = {:pot} && title = {:title} && id != {:id}",
		dbx.Params{"pot": pot, "title": string(stripped), "id": excludeID},
	)
	if errors.Is(err, sql.ErrNoRows) {
		return "", nil
	}
	if err != nil {
		return "", err
	}

	otherHeader, err := firstLineContent(app, other.Id)
	if err != nil {
		return "", err
	}

	if !headersMatch(rawHeader, otherHeader) {
		return "", nil
	}
	return stripped, nil
}

// headersMatch reports whether two card headers should be treated as
// the same title for merge-alert purposes: exact match once both are
// trimmed of leading/trailing whitespace. strings.TrimSpace already
// strips the full-width space (U+3000) commonly typed in Japanese
// text, via Go's Unicode White_Space table, so no extra normalization
// is needed here.
func headersMatch(a, b TitleCandidate) bool {
	return strings.TrimSpace(string(a)) == strings.TrimSpace(string(b))
}

// firstLineContent returns the content of a card's first line (see
// lines.go's textblockTags), which is always its header -- or "" if
// the card has no lines yet.
func firstLineContent(app core.App, cardID string) (TitleCandidate, error) {
	record, err := app.FindFirstRecordByFilter(
		"card_lines",
		"card = {:card} && ln = 0",
		dbx.Params{"card": cardID},
	)
	if errors.Is(err, sql.ErrNoRows) {
		return "", nil
	}
	if err != nil {
		return "", err
	}
	return TitleCandidate(record.GetString("content")), nil
}
