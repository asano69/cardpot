//go:build ignore

package notation

import (
	"net/url"
	"regexp"
	"strings"
)

// BracketKind is what the content of a single "[...]" means. The values are
// deliberately identical to the Lezer node names used by the frontend
// (see frontend/src/features/noteEditor/parser/cardpot/rules/bracket.ts), so a
// kind can be used directly as a node name.
type BracketKind string

const (
	Math         BracketKind = "Math"
	Icon         BracketKind = "Icon"
	ProjectLink  BracketKind = "ProjectLink"
	GoogleMap    BracketKind = "GoogleMap"
	Image        BracketKind = "Image"
	ExternalLink BracketKind = "ExternalLink"
	LinkedImage  BracketKind = "LinkedImage"
	WikiLink     BracketKind = "WikiLink"
)

// BracketDecision is the result of DecideBracketKind.
type BracketDecision struct {
	Kind BracketKind
	// Href is set for ExternalLink and LinkedImage.
	Href string
	// Src is set for Image and LinkedImage.
	Src string
	// HasLabel reports whether an ExternalLink carries label text. When it does,
	// the label is content[LabelFrom:LabelTo]. Unlike the TypeScript version this
	// returns offsets instead of a string, so the caller can parse the label in
	// place without recomputing where it starts.
	HasLabel  bool
	LabelFrom int
	LabelTo   int
}

// These patterns mirror the constants at the top of bracket.ts. Go's regexp
// (RE2) has no lookaround, but none is needed here.
var (
	iconRE       = regexp.MustCompile(`^.+\.icon(?:\*[1-9]\d*)?$`)
	projectRE    = regexp.MustCompile(`^/[^/]+(?:/.*)?$`)
	coordinateRE = regexp.MustCompile(`^[NS]\d+(?:\.\d+)?,[EW]\d+(?:\.\d+)?(?:,Z\d+)?$`)
	gyazoRE      = regexp.MustCompile(`(?i)^https?://(?:[0-9a-z-]+\.)?gyazo\.com/[0-9a-f]{32}(?:/raw)?$`)
	imageExtRE   = regexp.MustCompile(`(?i)\.(?:avif|bmp|gif|ico|jpe?g|png|svg|tiff?|webp)$`)
)

type urlKind int

const (
	notURL urlKind = iota
	imageURL
	linkURL
)

// inferURL classifies a single token. It approximates the browser's
// `new URL(value)` with net/url, which is more lenient (e.g. it accepts
// "http://" with no host); that is acceptable for classification.
func inferURL(value string) urlKind {
	if !strings.Contains(value, "://") {
		return notURL
	}
	u, err := url.Parse(value)
	if err != nil {
		return notURL
	}
	if gyazoRE.MatchString(value) || imageExtRE.MatchString(u.Path) {
		return imageURL
	}
	return linkURL
}

// DecideBracketKind classifies the already-paired content of one bracket
// (the text between "[" and "]"). It is pure and independent of the parser, so
// it stays testable on its own. Keep it in lockstep with decideBracketNodeType
// in bracket.ts.
func DecideBracketKind(content string) BracketDecision {
	if strings.HasPrefix(content, "$ ") {
		return BracketDecision{Kind: Math}
	}
	if iconRE.MatchString(content) {
		return BracketDecision{Kind: Icon}
	}
	if projectRE.MatchString(content) {
		return BracketDecision{Kind: ProjectLink}
	}

	// Only the first and last space-separated tokens can be URLs; everything in
	// between is label text (this is cosy's links_and_pages.rs rule).
	first, firstSpace := content, strings.Index(content, " ")
	if firstSpace >= 0 {
		first = content[:firstSpace]
	}
	lastSpace := strings.LastIndex(content, " ")
	last := ""
	if lastSpace >= 0 {
		last = content[lastSpace+1:]
	}

	if coordinateRE.MatchString(content) ||
		(first != "" && coordinateRE.MatchString(first)) ||
		(last != "" && coordinateRE.MatchString(last)) {
		return BracketDecision{Kind: GoogleMap}
	}

	firstKind := inferURL(first)
	if lastSpace < 0 {
		switch firstKind {
		case imageURL:
			return BracketDecision{Kind: Image, Src: first}
		case linkURL:
			return BracketDecision{Kind: ExternalLink, Href: first}
		}
		return BracketDecision{Kind: WikiLink}
	}

	lastKind := inferURL(last)
	// A linked image needs exactly two tokens that are both URLs, at least one
	// of them an image. With more tokens the middle text is a label instead.
	if firstSpace == lastSpace && firstKind != notURL && lastKind != notURL &&
		(firstKind == imageURL || lastKind == imageURL) {
		if firstKind == imageURL {
			return BracketDecision{Kind: LinkedImage, Src: first, Href: last}
		}
		return BracketDecision{Kind: LinkedImage, Src: last, Href: first}
	}
	if firstKind == linkURL {
		return BracketDecision{
			Kind: ExternalLink, Href: first,
			HasLabel: true, LabelFrom: firstSpace + 1, LabelTo: len(content),
		}
	}
	if lastKind != notURL {
		return BracketDecision{
			Kind: ExternalLink, Href: last,
			HasLabel: true, LabelFrom: 0, LabelTo: lastSpace,
		}
	}
	return BracketDecision{Kind: WikiLink}
}
