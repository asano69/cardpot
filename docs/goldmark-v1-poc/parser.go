//go:build ignore

// Package notation is a proof of concept: Cardpot's Scrapbox-compatible note
// syntax parsed with goldmark used as a framework (no fork, no CommonMark).
//
// The goal is to see whether goldmark's block/inline parser extension points can
// mirror the frontend's Lezer setup (frontend/.../parser/cardpot/index.ts) rule
// for rule: the same rules, in the same priority order, producing the same tree.
// A tree printer emits Lezer's toString() format so results can be compared with
// the frontend's tests directly.
package notation

import (
	"strings"

	"github.com/yuin/goldmark/ast"
	"github.com/yuin/goldmark/parser"
	"github.com/yuin/goldmark/text"
	"github.com/yuin/goldmark/util"
)

// NewParser returns a goldmark parser containing only Cardpot's rules. It never
// uses goldmark's default parsers: parser.NewParser starts empty, and this is
// the same as passing `remove: defaultParsers` to Lezer's markdown parser.
//
// Priorities: a lower value is tried first. Parsers sharing a trigger byte
// ("[") are the equivalent of consecutive entries of the frontend's array.
func NewParser() parser.Parser {
	return parser.NewParser(
		parser.WithBlockParsers(
			util.Prioritized(titleParser{}, 100), // must stay first: see title.ts
			util.Prioritized(codeBlockParser{}, 200),
			util.Prioritized(paragraphParser{}, 1000), // catch-all: must stay last
		),
		parser.WithInlineParsers(
			util.Prioritized(rule{[]byte{'\\'}, parseBackslash}, 50),
			util.Prioritized(closeRule{rule{[]byte{']', ' '}, parseClose}}, 60),
			util.Prioritized(rule{[]byte{'['}, parseDecoration}, 100),
			util.Prioritized(rule{[]byte{'['}, parseBlank}, 200),
			util.Prioritized(rule{[]byte{'['}, parseBracket}, 300),
			util.Prioritized(rule{[]byte{'`'}, parseInlineCode}, 400),
			util.Prioritized(rule{[]byte{'#'}, parseHashTag}, 500),
		),
	)
}

// Parse parses source into a goldmark AST made of Node and Block nodes.
func Parse(source []byte) ast.Node {
	return NewParser().Parse(text.NewReader(source))
}

// Tree parses source and prints the tree in Lezer's toString() format, e.g.
// "Document(Title,Paragraph(WikiLink(WikiLinkMark,WikiLinkMark)))". Plain text
// produces no node in Lezer, so goldmark's Text nodes are omitted.
func Tree(source []byte) string {
	return render(Parse(source))
}

func render(n ast.Node) string {
	name := ""
	switch v := n.(type) {
	case *ast.Document:
		name = "Document"
	case *Block:
		name = v.Name
	case *Node:
		name = v.Name
	}
	if name == "" {
		return ""
	}
	var kids []string
	for c := n.FirstChild(); c != nil; c = c.NextSibling() {
		if s := render(c); s != "" {
			kids = append(kids, s)
		}
	}
	if len(kids) == 0 {
		return name
	}
	return name + "(" + strings.Join(kids, ",") + ")"
}
