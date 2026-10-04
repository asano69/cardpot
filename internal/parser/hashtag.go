package parser

import "unicode/utf8"

// parseHashTag mirrors frontend rules/hashTag.ts: a "#" at the start of the
// text or right after whitespace, followed by a non-space character, runs up
// to the next whitespace. The node's Text is the tag without its "#".
func parseHashTag(s string, pos int) (*Node, int) {
	if pos > 0 {
		if prev, _ := utf8.DecodeLastRuneInString(s[:pos]); !isJSSpace(prev) {
			return nil, 0
		}
	}
	end := scanUntil(s, pos+1, isJSSpace)
	if end == pos+1 {
		return nil, 0
	}
	return &Node{Kind: KindHashTag, Text: s[pos+1 : end]}, end
}
