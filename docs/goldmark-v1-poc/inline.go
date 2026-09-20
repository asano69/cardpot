package notation

import (
	"bytes"
	"unicode/utf8"

	"github.com/yuin/goldmark/ast"
	"github.com/yuin/goldmark/parser"
	"github.com/yuin/goldmark/text"
)

// # How nested inline content works here
//
// Lezer can call cx.parser.parseInline(subText, offset) to parse the inside of
// "[* ... ]" recursively. goldmark has no such entry point: its inline loop
// walks a paragraph once, calling the parsers whose trigger byte matches. So
// containers are built the way goldmark's own link parser builds links:
//
//  1. The opening rule works out the whole extent up front (it scans for the
//     matching "]" by bracket depth, exactly like the frontend), consumes only
//     the opening delimiter and pushes a frame recording where the content ends.
//  2. The main loop then parses the content as ordinary siblings.
//  3. When the loop reaches the frame's end position, closeRule pops the frame
//     and moves the opening mark plus all siblings after it into one container.
//
// While a frame is open, every rule sees an "end" cut at the frame's limit, so
// nothing (inline code, a bracket, ...) can run past it, which is the same
// guarantee Lezer gets from parsing a substring.

var framesKey = parser.NewContextKey()

// frame is a container whose content is being parsed.
type frame struct {
	parent ast.Node
	// open is the opening mark, already appended to parent.
	open *Node
	// name is the container's node name; the marks are name+"Mark".
	name string
	// wraps are inner wrapper node names, outermost first. A decoration such as
	// "[*/ x]" is Bold(Mark, Italic(x), Mark): only the outermost node carries
	// marks, the others just re-wrap the content (see rules/decoration.ts).
	wraps []string
	// childFrom is where the content starts; limit is where it ends.
	childFrom, limit int
	// The closing mark. It equals limit..limit+1 for an ordinary "]", but a
	// label that precedes its URL ("[label https://x]") ends at the space, and
	// the mark is the "]" after the URL.
	markFrom, markTo int
}

type frameStack struct{ frames []frame }

func stackOf(pc parser.Context) *frameStack {
	if s, ok := pc.Get(framesKey).(*frameStack); ok {
		return s
	}
	s := &frameStack{}
	pc.Set(framesKey, s)
	return s
}

// top returns the innermost open frame of the paragraph being parsed. Frames
// left over from another paragraph are dropped defensively.
func (s *frameStack) top(parent ast.Node) *frame {
	for len(s.frames) > 0 && s.frames[len(s.frames)-1].parent != parent {
		s.frames = s.frames[:len(s.frames)-1]
	}
	if len(s.frames) == 0 {
		return nil
	}
	return &s.frames[len(s.frames)-1]
}

// cursor is a read-only view of the source at the current inline position.
type cursor struct {
	src []byte
	pos int // absolute offset of the trigger character
	// start is where the range being parsed begins (Lezer's cx.offset); a
	// hashtag right at the start is always at a word boundary.
	start int
	// end is exclusive: nothing at or beyond it may be read or consumed.
	end int
}

// at returns the byte at i, or -1 outside the readable range (Lezer's cx.char).
func (c cursor) at(i int) int {
	if i < 0 || i >= c.end {
		return -1
	}
	return int(c.src[i])
}

// matchClose returns the position of the "]" closing a bracket whose content
// starts at from, tracking nesting depth, or -1 if there is none on this line
// (the frontend's matchingBracket).
func (c cursor) matchClose(from int) int {
	depth := 0
	for i := from; i < c.end; i++ {
		switch c.src[i] {
		case '\n':
			return -1
		case '[':
			depth++
		case ']':
			if depth == 0 {
				return i
			}
			depth--
		}
	}
	return -1
}

// run is everything a rule needs: the cursor plus the goldmark handles.
type run struct {
	cursor
	parent ast.Node
	block  text.Reader
	pc     parser.Context
}

func newRun(parent ast.Node, block text.Reader, pc parser.Context) run {
	_, seg := block.PeekLine()
	c := cursor{src: block.Source(), pos: seg.Start, start: parent.Lines().At(0).Start, end: seg.Stop}
	if f := stackOf(pc).top(parent); f != nil {
		c.start = f.childFrom
		if f.limit < c.end {
			c.end = f.limit
		}
	}
	return run{cursor: c, parent: parent, block: block, pc: pc}
}

func (r run) advanceTo(pos int) { r.block.Advance(pos - r.pos) }

func (r run) push(f frame) {
	f.parent = r.parent
	s := stackOf(r.pc)
	s.frames = append(s.frames, f)
}

// rule adapts a function to goldmark's InlineParser. Registering rules with a
// trigger and a priority mirrors the frontend's parseInline array.
type rule struct {
	trigger []byte
	parse   func(run) ast.Node
}

func (r rule) Trigger() []byte { return r.trigger }

func (r rule) Parse(parent ast.Node, block text.Reader, pc parser.Context) ast.Node {
	return r.parse(newRun(parent, block, pc))
}

// closeRule is a rule that also resets the frame stack when a paragraph ends.
type closeRule struct{ rule }

func (closeRule) CloseBlock(_ ast.Node, _ text.Reader, pc parser.Context) {
	stackOf(pc).frames = nil
}

// ---- Rules ----

// parseBackslash consumes a backslash as plain text. goldmark's inline loop
// hard-codes CommonMark backslash escapes: after any "\" it refuses to trigger
// parsers on the next punctuation character. Cardpot has no such escape, so
// "\[page]" must still be a WikiLink; taking the backslash here, before the
// loop marks the next character as escaped, keeps it that way.
func parseBackslash(r run) ast.Node {
	r.advanceTo(r.pos + 1)
	return ast.NewTextSegment(text.NewSegment(r.pos, r.pos+1))
}

// parseClose finishes the innermost open frame. It is triggered by "]" and by
// a space (a label ends at a space when it comes before its URL) and only acts
// when the position is exactly the frame's limit.
func parseClose(r run) ast.Node {
	s := stackOf(r.pc)
	f := s.top(r.parent)
	if f == nil || r.pos != f.limit {
		return nil
	}
	s.frames = s.frames[:len(s.frames)-1]
	r.advanceTo(f.markTo)

	// Detach the opening mark and everything after it.
	var kids []ast.Node
	for n := f.open.NextSibling(); n != nil; n = f.open.NextSibling() {
		r.parent.RemoveChild(r.parent, n)
		kids = append(kids, n)
	}
	r.parent.RemoveChild(r.parent, f.open)

	for i := len(f.wraps) - 1; i >= 0; i-- {
		w := newNode(f.wraps[i], f.childFrom, f.limit)
		for _, k := range kids {
			w.AppendChild(w, k)
		}
		kids = []ast.Node{w}
	}

	c := newNode(f.name, f.open.From, f.markTo)
	c.AppendChild(c, f.open)
	for _, k := range kids {
		c.AppendChild(c, k)
	}
	c.AppendChild(c, newNode(f.name+"Mark", f.markFrom, f.markTo))
	return c
}

// decorations are recognized in this fixed nesting order (outermost first),
// whatever order they appear in the source. See rules/decoration.ts.
var decorations = []struct {
	char byte
	node string
}{
	{'*', "Bold"},
	{'/', "Italic"},
}

func isDecoChar(ch int) bool {
	for _, d := range decorations {
		if ch == int(d.char) {
			return true
		}
	}
	return false
}

// parseDecoration handles "[* text]", "[/ text]" and combinations like "[*/ text]".
func parseDecoration(r run) ast.Node {
	if r.at(r.pos) != '[' {
		return nil
	}
	i := r.pos + 1
	for isDecoChar(r.at(i)) {
		i++
	}
	if i == r.pos+1 || r.at(i) != ' ' {
		return nil
	}
	decos := r.src[r.pos+1 : i]
	contentFrom := i + 1
	end := r.matchClose(contentFrom)
	if end < 0 || end == contentFrom {
		return nil
	}

	var names []string
	for _, d := range decorations {
		if bytes.IndexByte(decos, d.char) >= 0 {
			names = append(names, d.node)
		}
	}
	open := newNode(names[0]+"Mark", r.pos, contentFrom)
	r.push(frame{
		open: open, name: names[0], wraps: names[1:],
		childFrom: contentFrom, limit: end, markFrom: end, markTo: end + 1,
	})
	r.advanceTo(contentFrom)
	return open
}

// parseBlank handles "[ ]": a bracket pair holding only whitespace. It runs
// before parseBracket so it never becomes a WikiLink.
func parseBlank(r run) ast.Node {
	if r.at(r.pos) != '[' {
		return nil
	}
	end := r.pos + 1
	for end < r.end && r.src[end] != ']' && r.src[end] != '\n' {
		end++
	}
	if r.at(end) != ']' || end == r.pos+1 || !isBlank(r.src[r.pos+1:end]) {
		return nil
	}
	r.advanceTo(end + 1)
	return newNode("Blank", r.pos, end+1)
}

// parseBracket dispatches every other "[...]" (see rules/bracket.ts): find the
// matching "]" first, then classify the content.
func parseBracket(r run) ast.Node {
	if r.at(r.pos) != '[' {
		return nil
	}
	if r.at(r.pos+1) == '[' {
		return parseStrong(r)
	}
	return parseSingle(r)
}

func parseSingle(r run) ast.Node {
	end := r.matchClose(r.pos + 1)
	if end < 0 || end == r.pos+1 {
		return nil
	}
	contentFrom, to := r.pos+1, end+1
	d := DecideBracketKind(string(r.src[contentFrom:end]))

	switch d.Kind {
	case WikiLink, ProjectLink:
		r.advanceTo(to)
		return markedNode(string(d.Kind), r.pos, to)
	case Math, Icon, GoogleMap, Image, LinkedImage:
		r.advanceTo(to)
		return newNode(string(d.Kind), r.pos, to)
	}

	// ExternalLink.
	if !d.HasLabel {
		r.advanceTo(to)
		return markedNode("ExternalLink", r.pos, to)
	}
	// Only the label is parsed as inline content. The URL part is skipped: it
	// is either before the label (advanceTo below jumps over it) or after it
	// (the frame closes at the label's end and jumps to the final "]").
	open := newNode("ExternalLinkMark", r.pos, r.pos+1)
	childFrom := contentFrom + d.LabelFrom
	r.push(frame{
		open: open, name: "ExternalLink",
		childFrom: childFrom, limit: contentFrom + d.LabelTo, markFrom: end, markTo: to,
	})
	r.advanceTo(childFrom)
	return open
}

func parseStrong(r run) ast.Node {
	contentFrom := r.pos + 2
	innerEnd := r.matchClose(contentFrom)
	if innerEnd < 0 || innerEnd == contentFrom || r.at(innerEnd+1) != ']' {
		return nil
	}
	to := innerEnd + 2

	child := ""
	switch DecideBracketKind(string(r.src[contentFrom:innerEnd])).Kind {
	case Image:
		child = "StrongImage"
	case Icon:
		child = "StrongIcon"
	}
	if child != "" {
		n := newNode("Strong", r.pos, to)
		n.AppendChild(n, newNode("StrongMark", r.pos, contentFrom))
		n.AppendChild(n, newNode(child, contentFrom, innerEnd))
		n.AppendChild(n, newNode("StrongMark", innerEnd, to))
		r.advanceTo(to)
		return n
	}

	open := newNode("StrongMark", r.pos, contentFrom)
	r.push(frame{
		open: open, name: "Strong",
		childFrom: contentFrom, limit: innerEnd, markFrom: innerEnd, markTo: to,
	})
	r.advanceTo(contentFrom)
	return open
}

// parseInlineCode handles `code`: a backtick pair on one line, possibly empty.
func parseInlineCode(r run) ast.Node {
	if r.at(r.pos) != '`' {
		return nil
	}
	i := r.pos + 1
	for i < r.end && r.src[i] != '`' && r.src[i] != '\n' {
		i++
	}
	if r.at(i) != '`' {
		return nil
	}
	r.advanceTo(i + 1)
	return markedNode("Code", r.pos, i+1)
}

// parseHashTag handles "#tag": a "#" at the start of the range or after
// whitespace, running to the next whitespace (Scrapbox's `(?:^|\s)#\S+`).
func parseHashTag(r run) ast.Node {
	if r.at(r.pos) != '#' || r.pos+1 >= r.end {
		return nil
	}
	if r.pos > r.start {
		if prev, _ := utf8.DecodeLastRune(r.src[:r.pos]); !isJSSpace(prev) {
			return nil
		}
	}
	if next, _ := utf8.DecodeRune(r.src[r.pos+1 : r.end]); isJSSpace(next) {
		return nil
	}
	end := r.pos + 1
	for end < r.end {
		ch, size := utf8.DecodeRune(r.src[end:r.end])
		if isJSSpace(ch) {
			break
		}
		end += size
	}
	r.advanceTo(end)
	return newNode("HashTag", r.pos, end)
}
