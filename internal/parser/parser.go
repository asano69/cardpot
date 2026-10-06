package parser

import "strings"

// Note is a parsed card text. Nodes are in document order.
type Note struct {
	Nodes []*Node
}

// Parse never fails and treats the first non-blank line only when it is the
// document's first line as a title.
func Parse(text string) *Note {
	return &Note{Nodes: parseBlocks(strings.Split(text, "\n"))}
}

// Title returns the raw first title line, or an empty string for a blank first
// line or a document with no title.
func (n *Note) Title() string {
	if len(n.Nodes) > 0 && n.Nodes[0].Kind == KindTitle {
		return n.Nodes[0].Text
	}
	return ""
}

// Walk visits each node in document order, stopping when fn returns false.
// It reports whether it visited the entire tree.
func (n *Note) Walk(fn func(*Node) bool) bool {
	return walkNodes(n.Nodes, fn)
}

// LinkTitles returns the title of every wiki link and hashtag in document
// order. A hashtag links to the title that follows its leading "#".
func (n *Note) LinkTitles() (titles []string) {
	for _, link := range n.Links() {
		titles = append(titles, link.Title)
	}
	return titles
}

// Link is a wiki link or hashtag together with its place in the card text.
type Link struct {
	// Title is the title it links to (a hashtag's without its "#").
	Title   string
	HashTag bool
	// Line is the 0-based line, Start and End the byte range [Start, End) of
	// the whole notation ("[title]" or "#title") within that line.
	Line, Start, End int
}

// Links returns every wiki link and hashtag in document order.
func (n *Note) Links() (links []Link) {
	n.Walk(func(node *Node) bool {
		if node.Kind == KindWikiLink || node.Kind == KindHashTag {
			links = append(links, Link{
				Title:   node.Text,
				HashTag: node.Kind == KindHashTag,
				Line:    node.Line,
				Start:   node.Start,
				End:     node.End,
			})
		}
		return true
	})
	return links
}

// FirstImageSrc returns the first image or linked-image source in document
// order, or an empty string when the document contains no image.
func (n *Note) FirstImageSrc() (src string) {
	n.Walk(func(node *Node) bool {
		if node.Kind == KindImage || node.Kind == KindLinkedImage {
			src = node.Text
			return false
		}
		return true
	})
	return src
}

// String renders the note's tree shape.
func (n *Note) String() string {
	parts := make([]string, len(n.Nodes))
	for i, node := range n.Nodes {
		parts[i] = node.String()
	}
	return "Document(" + strings.Join(parts, ",") + ")"
}
