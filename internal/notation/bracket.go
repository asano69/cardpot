// Package notation implements the parts of Cardpot's Scrapbox-compatible
// note syntax that the backend needs. It is deliberately NOT a full parser:
// DecideBracketKind classifies already-delimited bracket content (the text
// between a matched "[" and "]"), and ExtractWikiLinkTitles finds the wiki
// links in a card's text. Both mirror
// frontend/src/features/noteEditor/parser/cardpot (rules/bracket.ts and the
// inline/block rules around it) and must stay in lockstep with it; add a
// test here whenever the frontend's test suite gains one, and vice versa
// (see internal/slug's own comment for this same pattern).
package notation

import (
	"net/url"
	"regexp"
	"strings"
)

// BracketKind is what a single "[...]" notation represents.
type BracketKind string

const (
	KindMath         BracketKind = "Math"
	KindIcon         BracketKind = "Icon"
	KindProjectLink  BracketKind = "ProjectLink"
	KindGoogleMap    BracketKind = "GoogleMap"
	KindImage        BracketKind = "Image"
	KindExternalLink BracketKind = "ExternalLink"
	KindLinkedImage  BracketKind = "LinkedImage"
	KindWikiLink     BracketKind = "WikiLink"
)

var (
	iconRe       = regexp.MustCompile(`^.+\.icon(?:\*[1-9]\d*)?$`)
	projectRe    = regexp.MustCompile(`^/[^/]+(?:/.*)?$`)
	coordinateRe = regexp.MustCompile(`^[NS]\d+(?:\.\d+)?,[EW]\d+(?:\.\d+)?(?:,Z\d+)?$`)
	gyazoRe      = regexp.MustCompile(`(?i)^https?://(?:[0-9a-z-]+\.)?gyazo\.com/[0-9a-f]{32}(?:/raw)?$`)
	imageExtRe   = regexp.MustCompile(`(?i)\.(?:avif|bmp|gif|ico|jpe?g|png|svg|tiff?|webp)$`)
)

type urlKind int

const (
	urlNone urlKind = iota
	urlImage
	urlLink
)

// inferURL classifies one whitespace-free token as an image URL, another
// URL, or not a URL at all.
func inferURL(value string) urlKind {
	if !strings.Contains(value, "://") {
		return urlNone
	}
	u, err := url.Parse(value)
	if err != nil || u.Scheme == "" {
		return urlNone
	}
	if gyazoRe.MatchString(value) || imageExtRe.MatchString(u.Path) {
		return urlImage
	}
	return urlLink
}

// DecideBracketKind classifies non-empty bracket content, checking the same
// cases in the same order as decideBracketNodeType in rules/bracket.ts. Only
// the first and last space-separated tokens can be URLs, as in cosy's
// links_and_pages.rs. The frontend also returns each kind's href/src/label;
// the backend has no use for them, so only the kind is returned here.
func DecideBracketKind(content string) BracketKind {
	if strings.HasPrefix(content, "$ ") {
		return KindMath
	}
	if iconRe.MatchString(content) {
		return KindIcon
	}
	if projectRe.MatchString(content) {
		return KindProjectLink
	}

	firstSpace := strings.Index(content, " ")
	lastSpace := strings.LastIndex(content, " ")
	first, last := content, ""
	if firstSpace >= 0 {
		first, last = content[:firstSpace], content[lastSpace+1:]
	}
	if coordinateRe.MatchString(content) || coordinateRe.MatchString(first) || coordinateRe.MatchString(last) {
		return KindGoogleMap
	}

	firstKind := inferURL(first)
	if firstSpace < 0 {
		switch firstKind {
		case urlImage:
			return KindImage
		case urlLink:
			return KindExternalLink
		}
		return KindWikiLink
	}

	lastKind := inferURL(last)
	// A linked image needs exactly two URL tokens, at least one an image.
	if firstSpace == lastSpace && firstKind != urlNone && lastKind != urlNone &&
		(firstKind == urlImage || lastKind == urlImage) {
		return KindLinkedImage
	}
	if firstKind == urlLink || lastKind != urlNone {
		return KindExternalLink
	}
	return KindWikiLink
}
