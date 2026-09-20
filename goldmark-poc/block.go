package notation

import (
	"bytes"

	"github.com/yuin/goldmark/ast"
	"github.com/yuin/goldmark/parser"
	"github.com/yuin/goldmark/text"
)

// Block parsers are registered with a nil Trigger ("free" parsers) so goldmark
// offers them every line regardless of its first character, in priority order.
// Like the frontend's parseBlock array, the order is the dispatch order.
//
// Contract reminders (goldmark):
//   - Open returns (nil, NoChildren) to decline. If NO parser claims a
//     non-blank line, parsing stops, so the paragraph parser must accept all.
//   - A single-line block advances the reader to just before the newline, then
//     returns Close from Continue on the next line.

// ---- Title ----

// titleParser claims the document's first line as plain text (rules/title.ts):
// no indentation, block prefix or inline notation is interpreted, so the
// parser agrees with the title the server resolves from the raw first line.
type titleParser struct{}

func (titleParser) Trigger() []byte { return nil }

func (titleParser) Open(_ ast.Node, reader text.Reader, _ parser.Context) (ast.Node, parser.State) {
	line, seg := reader.PeekLine()
	// Only the very first line is the title. A blank first line is left to the
	// paragraph parser, and the line after it is body text, not a title.
	if seg.Start != 0 || isBlank(line) {
		return nil, parser.NoChildren
	}
	reader.Advance(seg.Len() - 1)
	return &Block{Name: "Title", raw: true}, parser.NoChildren
}

func (titleParser) Continue(ast.Node, text.Reader, parser.Context) parser.State {
	return parser.Close
}
func (titleParser) Close(ast.Node, text.Reader, parser.Context) {}
func (titleParser) CanInterruptParagraph() bool                 { return true }
func (titleParser) CanAcceptIndentedLine() bool                 { return true }

// ---- Paragraph (one source line = one block) ----

// paragraphParser is the catch-all: every remaining line becomes its own
// Paragraph(Indent?, ...inline), mirroring rules/paragraph.ts.
type paragraphParser struct{}

func (paragraphParser) Trigger() []byte { return nil }

func (paragraphParser) Open(_ ast.Node, reader text.Reader, _ parser.Context) (ast.Node, parser.State) {
	line, seg := reader.PeekLine()
	// The newline is excluded from the inline segment on purpose: goldmark's
	// inline loop turns a trailing backslash or two spaces before "\n" into a
	// hard line break, which has no meaning in Cardpot.
	body := trimEOL(line)

	block := &Block{Name: "Paragraph"}
	if isBlank(body) {
		// Claimed but silent (see Block).
		block.Name, block.raw = "", true
	} else {
		indent, _ := leadingIndent(body)
		if indent > 0 {
			block.AppendChild(block, newNode("Indent", seg.Start, seg.Start+indent))
		}
		block.Lines().Append(text.NewSegment(seg.Start+indent, seg.Start+len(body)))
	}
	reader.Advance(seg.Len() - 1)
	return block, parser.NoChildren
}

func (paragraphParser) Continue(ast.Node, text.Reader, parser.Context) parser.State {
	return parser.Close
}
func (paragraphParser) Close(ast.Node, text.Reader, parser.Context) {}
func (paragraphParser) CanInterruptParagraph() bool                 { return true }
func (paragraphParser) CanAcceptIndentedLine() bool                 { return true }

// ---- CodeBlock (multi-line, ends when the indentation returns) ----

const codePrefix = "code:"

// codeBlockParser handles "code:..." plus every following line indented deeper
// than the declaration (rules/codeBlock.ts and rules/indentedBlock.ts). There
// is no closing marker; a line at the same or a shallower depth ends the block.
type codeBlockParser struct{}

func (codeBlockParser) Trigger() []byte { return nil }

func (codeBlockParser) Open(_ ast.Node, reader text.Reader, _ parser.Context) (ast.Node, parser.State) {
	line, seg := reader.PeekLine()
	body := trimEOL(line)
	indentBytes, indentRunes := leadingIndent(body)
	if !bytes.HasPrefix(body[indentBytes:], []byte(codePrefix)) {
		return nil, parser.NoChildren
	}

	block := &Block{Name: "CodeBlock", raw: true, declIndent: indentRunes}
	if indentBytes > 0 {
		block.AppendChild(block, newNode("Indent", seg.Start, seg.Start+indentBytes))
	}
	block.AppendChild(block, newNode("CodeBlockMark", seg.Start+indentBytes, seg.Start+len(body)))
	reader.Advance(seg.Len() - 1)
	return block, parser.NoChildren
}

func (codeBlockParser) Continue(node ast.Node, reader text.Reader, _ parser.Context) parser.State {
	block := node.(*Block)
	line, seg := reader.PeekLine()
	body := trimEOL(line)
	// A blank line has depth 0 and therefore ends the block, like the frontend.
	if _, depth := leadingIndent(body); depth <= block.declIndent {
		return parser.Close
	}
	// Only the block's own indent level (declaration depth + 1) is syntax;
	// anything deeper is raw code.
	own := byteOffsetAfterRunes(body, block.declIndent+1)
	block.AppendChild(block, newNode("Indent", seg.Start, seg.Start+own))
	reader.Advance(seg.Len() - 1)
	return parser.Continue | parser.NoChildren
}

func (codeBlockParser) Close(ast.Node, text.Reader, parser.Context) {}
func (codeBlockParser) CanInterruptParagraph() bool                 { return true }
func (codeBlockParser) CanAcceptIndentedLine() bool                 { return true }
