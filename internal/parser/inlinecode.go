package parser

import "strings"

// parseInlineCode mirrors frontend rules/inlineCode.ts.
func parseInlineCode(s string, pos int) (*Node, int) {
	end := strings.IndexByte(s[pos+1:], '`')
	if end < 0 {
		return nil, 0
	}
	return &Node{Kind: KindInlineCode}, pos + end + 2
}
