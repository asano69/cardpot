package parser

import "strings"

// parseBareURL mirrors frontend rules/bareUrl.ts: an http(s) URL written
// without brackets runs up to the next whitespace or "]". It is consumed so
// that a "[" inside the URL does not start a wiki link.
func parseBareURL(s string, pos int) (*Node, int) {
	rest := s[pos:]
	start := 0
	switch {
	case strings.HasPrefix(rest, "https://"):
		start = len("https://")
	case strings.HasPrefix(rest, "http://"):
		start = len("http://")
	default:
		return nil, 0
	}
	end := scanUntil(rest, start, func(r rune) bool { return r == ']' || isJSSpace(r) })
	if end == start {
		return nil, 0
	}
	return &Node{Kind: KindBareURL}, pos + end
}
