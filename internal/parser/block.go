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

var blockRules = []blockRule{parseTitle, parseCodeBlock}

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
