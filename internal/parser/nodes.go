// Package parser parses the subset of Cardpot's Scrapbox-compatible syntax
// needed by backend services. Its rules mirror the frontend parser/cardpot
// rules and should be kept in lockstep with them.
package parser

import "strings"

// Kind identifies what a Node represents.
type Kind string

const (
	KindTitle     Kind = "Title"
	KindLine      Kind = "Line"
	KindCodeBlock Kind = "CodeBlock"

	KindInlineCode Kind = "InlineCode"
	KindDecoration Kind = "Decoration"
	KindStrong     Kind = "Strong"
	KindBlank      Kind = "Blank"

	KindWikiLink     Kind = "WikiLink"
	KindImage        Kind = "Image"
	KindLinkedImage  Kind = "LinkedImage"
	KindExternalLink Kind = "ExternalLink"
	KindMath         Kind = "Math"
	KindIcon         Kind = "Icon"
	KindProjectLink  Kind = "ProjectLink"
	KindGoogleMap    Kind = "GoogleMap"
)

// Node is a notation found in a card. Only Line, Decoration, and Strong have
// children. Text holds the raw title, wiki-link title, image source, or raw
// bracket content, according to Kind.
type Node struct {
	Kind     Kind
	Text     string
	Children []*Node
}

// String renders a node's tree shape.
func (n *Node) String() string {
	if len(n.Children) == 0 {
		return string(n.Kind)
	}
	parts := make([]string, len(n.Children))
	for i, child := range n.Children {
		parts[i] = child.String()
	}
	return string(n.Kind) + "(" + strings.Join(parts, ",") + ")"
}

func walkNodes(nodes []*Node, fn func(*Node) bool) bool {
	for _, n := range nodes {
		if !fn(n) || !walkNodes(n.Children, fn) {
			return false
		}
	}
	return true
}
