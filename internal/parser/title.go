package parser

// parseTitle mirrors frontend rules/title.ts. It claims only the first,
// non-blank document line, which the block loop presents before other rules.
func parseTitle(c *cursor) *Node {
	if c.i != 0 {
		return nil
	}
	n := &Node{Kind: KindTitle, Text: c.line()}
	c.next()
	return n
}
