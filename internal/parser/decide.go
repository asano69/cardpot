package parser

import (
	"net/url"
	"regexp"
	"strings"
)

// Decision is the classification of a non-empty bracket notation.
type Decision struct {
	Kind Kind
	Src  string
}

var (
	iconRe       = regexp.MustCompile(`^.+\.icon(?:\*[1-9]\d*)?$`)
	projectRe    = regexp.MustCompile(`^/[^/]+(?:/.*)?$`)
	coordinateRe = regexp.MustCompile(`^[NS]\d+(?:\.\d+)?,[EW]\d+(?:\.\d+)?(?:,Z\d+)?$`)
	gyazoRe      = regexp.MustCompile(`(?i)^https?://(?:[0-9a-z-]+\.)?gyazo\.com/[0-9a-f]{32}(?:/raw)?$`)
	// Matched against the whole URL so that a trailing ".png" in the query
	// or fragment counts too; keep in sync with frontend rules/bracket.ts.
	imageExtRe = regexp.MustCompile(`(?i)\.(?:avif|bmp|gif|ico|jpe?g|png|svg|tiff?|webp)(?:[?#].*)?$`)
)

type urlKind int

const (
	urlNone urlKind = iota
	urlImage
	urlLink
)

func inferURL(value string) urlKind {
	if !strings.Contains(value, "://") {
		return urlNone
	}
	u, err := url.Parse(value)
	if err != nil || u.Scheme == "" {
		return urlNone
	}
	if gyazoRe.MatchString(value) || imageExtRe.MatchString(value) {
		return urlImage
	}
	return urlLink
}

// DecideBracket classifies non-empty bracket content using the same ordering
// as the frontend bracket rule.
func DecideBracket(content string) Decision {
	if strings.HasPrefix(content, "$ ") {
		return Decision{Kind: KindMath}
	}
	if iconRe.MatchString(content) {
		return Decision{Kind: KindIcon}
	}
	if projectRe.MatchString(content) {
		return Decision{Kind: KindProjectLink}
	}

	firstSpace := strings.IndexByte(content, ' ')
	lastSpace := strings.LastIndexByte(content, ' ')
	first, last := content, ""
	if firstSpace >= 0 {
		first, last = content[:firstSpace], content[lastSpace+1:]
	}
	if coordinateRe.MatchString(content) || coordinateRe.MatchString(first) || coordinateRe.MatchString(last) {
		return Decision{Kind: KindGoogleMap}
	}

	firstKind := inferURL(first)
	if firstSpace < 0 {
		switch firstKind {
		case urlImage:
			return Decision{Kind: KindImage, Src: first}
		case urlLink:
			return Decision{Kind: KindExternalLink}
		}
		return Decision{Kind: KindWikiLink}
	}

	lastKind := inferURL(last)
	if firstSpace == lastSpace && firstKind != urlNone && lastKind != urlNone && (firstKind == urlImage || lastKind == urlImage) {
		src := last
		if firstKind == urlImage {
			src = first
		}
		return Decision{Kind: KindLinkedImage, Src: src}
	}
	if firstKind == urlLink || lastKind != urlNone {
		return Decision{Kind: KindExternalLink}
	}
	return Decision{Kind: KindWikiLink}
}
