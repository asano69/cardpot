package parser

import (
	"strings"
)

type cursor struct {
	lines []string
	i     int
}

func (c *cursor) done() bool   { return c.i >= len(c.lines) }
func (c *cursor) line() string { return c.lines[c.i] }
func (c *cursor) next()        { c.i++ }

type blockRule func(*cursor) *Node

var blockRules = []blockRule{parseTitle, parseCodeBlock, parseTable, parseQuote}

func parseBlocks(lines []string) []*Node {
	c := &cursor{lines: lines}
	var nodes []*Node
	for !c.done() {
		start := c.i
		var n *Node
		if isBlank(c.line()) {
			c.next()
		} else if n = tryBlockRules(c); n == nil {
			n = parseLine(c)
		}
		if n != nil {
			n.StartLine, n.EndLine = start, c.i
			nodes = append(nodes, n)
		}
		if c.i == start {
			c.next()
		}
	}
	return nodes
}

func tryBlockRules(c *cursor) *Node {
	for _, rule := range blockRules {
		if n := rule(c); n != nil {
			return n
		}
	}
	return nil
}

func parseLine(c *cursor) *Node {
	n := &Node{Kind: KindLine, Children: parseInline(c.line())}
	c.next()
	return n
}

// parseCodeBlock consumes a code: declaration and following deeper-indented
// raw body lines. It mirrors frontend rules/codeBlock.ts.
func parseCodeBlock(c *cursor) *Node {
	depth, offset := measureIndent(c.line())
	rest := c.line()[offset:]
	if !strings.HasPrefix(rest, "code:") {
		return nil
	}
	c.next()

	// Every body line is deeper than the declaration, so dropping depth+1
	// characters removes only the block's own indent level.
	raw := bodyLines(c, depth)
	body := make([]string, len(raw))
	for i, line := range raw {
		body[i] = dropRunes(line, depth+1)
	}
	info := strings.TrimSpace(strings.TrimPrefix(rest, "code:"))
	return &Node{Kind: KindCodeBlock, Text: info, Body: body}
}

// parseTable consumes a table: declaration and the deeper-indented rows after
// it. The declaration is not parsed; every row is split into cells at tabs and
// each cell is parsed on its own. It mirrors frontend rules/table.ts.
func parseTable(c *cursor) *Node {
	depth, offset := measureIndent(c.line())
	if !strings.HasPrefix(c.line()[offset:], "table:") {
		return nil
	}
	c.next()

	n := &Node{Kind: KindTable}
	for _, line := range bodyLines(c, depth) {
		for _, cell := range strings.Split(dropRunes(line, depth+1), "\t") {
			n.Children = append(n.Children, parseInline(cell)...)
		}
	}
	return n
}

// parseQuote parses a line that starts with ">" (after its indent). The mark
// and one following space are dropped and the rest is parsed as inline text.
// It mirrors frontend rules/quote.ts.
func parseQuote(c *cursor) *Node {
	_, offset := measureIndent(c.line())
	rest := c.line()[offset:]
	if !strings.HasPrefix(rest, ">") {
		return nil
	}
	c.next()
	return &Node{Kind: KindQuote, Children: parseInline(strings.TrimPrefix(rest[1:], " "))}
}

func bodyLines(c *cursor, depth int) []string {
	start := c.i
	for !c.done() {
		lineDepth, _ := measureIndent(c.line())
		if lineDepth <= depth {
			break
		}
		c.next()
	}
	return c.lines[start:c.i]
}
