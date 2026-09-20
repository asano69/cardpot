package parser

// inlineRule mirrors the frontend parseInline rule contract.
type inlineRule func(s string, pos int) (n *Node, end int)

func parseInline(s string) []*Node {
	var nodes []*Node
	for pos := 0; pos < len(s); {
		n, end := parseAt(s, pos)
		if n == nil || end <= pos {
			pos++
			continue
		}
		nodes = append(nodes, n)
		pos = end
	}
	return nodes
}

func parseAt(s string, pos int) (*Node, int) {
	switch s[pos] {
	case '[':
		return parseBracket(s, pos)
	case '`':
		return parseInlineCode(s, pos)
	default:
		return nil, 0
	}
}

var (
	_ inlineRule = parseBracket
	_ inlineRule = parseInlineCode
)
