package notation

import "strings"

const codeBlockPrefix = "code:"

// ExtractWikiLinkTitles returns the raw title of every [wiki link] in a
// card's text, in document order and without deduplication (what counts as
// "the same link" is the caller's policy).
//
// Mirrors the frontend parser for the cases that matter to link extraction:
//   - the first line is the card's title and is never scanned;
//   - a "code:" line plus the more deeply indented lines after it is a code
//     block and is skipped;
//   - `inline code` is skipped;
//   - a decoration ("[* text]") or strong ("[[text]]") is scanned inside;
//   - every other bracket notation is not a wiki link.
//
// Known divergence: the label of a labelled external link
// ("[https://example.com/ label [page]]") is not scanned.
func ExtractWikiLinkTitles(text string) []string {
	var sc scanner
	codeIndent := -1 // indent depth of the open "code:" declaration, or -1
	for i, line := range strings.Split(text, "\n") {
		if i == 0 {
			continue
		}
		depth, offset := measureIndent(line)
		if codeIndent >= 0 {
			if depth > codeIndent {
				continue
			}
			codeIndent = -1
		}
		if strings.HasPrefix(line[offset:], codeBlockPrefix) {
			codeIndent = depth
			continue
		}
		sc.inline(line)
	}
	return sc.titles
}

// scanner walks one line of inline notation. Brackets, backticks and spaces
// are all ASCII, so plain byte indexing is safe on UTF-8 text.
type scanner struct {
	titles []string
}

// inline tries the inline rules at every position, like Lezer does: a rule
// returns the end of what it consumed, or -1 to let the next position try.
func (sc *scanner) inline(s string) {
	for pos := 0; pos < len(s); {
		if end := sc.at(s, pos); end > pos {
			pos = end
		} else {
			pos++
		}
	}
}

// at applies the rules in the frontend's parseInline order: decoration,
// blank, bracket, inline code.
func (sc *scanner) at(s string, pos int) int {
	switch s[pos] {
	case '[':
		if end := sc.decoration(s, pos); end >= 0 {
			return end
		}
		if end := blankEnd(s, pos); end >= 0 {
			return end
		}
		if pos+1 < len(s) && s[pos+1] == '[' {
			return sc.strong(s, pos)
		}
		return sc.single(s, pos)
	case '`':
		return inlineCodeEnd(s, pos)
	}
	return -1
}

// decoration handles "[*/ text]": one or more of the decoration characters
// (see rules/decoration.ts), a space, then non-empty content that is
// scanned recursively.
func (sc *scanner) decoration(s string, pos int) int {
	i := pos + 1
	for i < len(s) && (s[i] == '*' || s[i] == '/') {
		i++
	}
	if i == pos+1 || i >= len(s) || s[i] != ' ' {
		return -1
	}
	contentFrom := i + 1
	end := matchingBracket(s, contentFrom)
	if end < 0 || end == contentFrom {
		return -1
	}
	sc.inline(s[contentFrom:end])
	return end + 1
}

// blankEnd handles "[ ]": whitespace-only content up to the first "]".
func blankEnd(s string, pos int) int {
	n := strings.IndexByte(s[pos+1:], ']')
	if n < 0 || !isBlank(s[pos+1:pos+1+n]) {
		return -1
	}
	return pos + 1 + n + 1
}

// strong handles "[[text]]". Images and icons inside are leaves; anything
// else is scanned as inline text.
func (sc *scanner) strong(s string, pos int) int {
	innerEnd := matchingBracket(s, pos+2)
	if innerEnd < 0 || innerEnd == pos+2 || innerEnd+1 >= len(s) || s[innerEnd+1] != ']' {
		return -1
	}
	content := s[pos+2 : innerEnd]
	switch DecideBracketKind(content) {
	case KindImage, KindIcon:
	default:
		sc.inline(content)
	}
	return innerEnd + 2
}

// single handles "[content]": the matching "]" is found first (tracking
// nesting), then the content is classified.
func (sc *scanner) single(s string, pos int) int {
	end := matchingBracket(s, pos+1)
	if end < 0 || end == pos+1 {
		return -1
	}
	content := s[pos+1 : end]
	if DecideBracketKind(content) == KindWikiLink {
		sc.titles = append(sc.titles, content)
	}
	return end + 1
}

// matchingBracket returns the index of the "]" closing a "[" whose content
// starts at from, or -1.
func matchingBracket(s string, from int) int {
	depth := 0
	for i := from; i < len(s); i++ {
		switch s[i] {
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

// inlineCodeEnd returns the end of a `code` span starting at pos, or -1.
func inlineCodeEnd(s string, pos int) int {
	n := strings.IndexByte(s[pos+1:], '`')
	if n < 0 {
		return -1
	}
	return pos + 1 + n + 1
}

// isJSSpace reports whether r matches ECMAScript's `\s`. The frontend
// measures indentation with that class, and Go's unicode.IsSpace differs
// from it (it accepts U+0085 and rejects U+FEFF).
func isJSSpace(r rune) bool {
	switch r {
	case '\t', '\n', '\v', '\f', '\r', ' ', 0xA0, 0x1680, 0x2028, 0x2029, 0x202F, 0x205F, 0x3000, 0xFEFF:
		return true
	}
	return r >= 0x2000 && r <= 0x200A
}

// measureIndent returns the number of leading whitespace characters (the
// indent depth, as the frontend counts it) and the byte offset where the
// line's content starts.
func measureIndent(line string) (depth, offset int) {
	for i, r := range line {
		if !isJSSpace(r) {
			return depth, i
		}
		depth++
	}
	return depth, len(line)
}

// isBlank reports whether s is non-empty and only whitespace.
func isBlank(s string) bool {
	if s == "" {
		return false
	}
	for _, r := range s {
		if !isJSSpace(r) {
			return false
		}
	}
	return true
}
