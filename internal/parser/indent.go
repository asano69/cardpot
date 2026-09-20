package parser

import (
	"strings"
	"unicode"
)

// isJSSpace reports whether r matches ECMAScript's \s. It mirrors the
// frontend parser's indent.ts; unicode.IsSpace is deliberately not used.
func isJSSpace(r rune) bool {
	return unicode.Is(unicode.Zs, r) || strings.ContainsRune("\t\n\v\f\r\u2028\u2029\uFEFF", r)
}

// measureIndent returns leading ECMAScript-whitespace character count and the
// byte offset immediately after it.
func measureIndent(line string) (depth, offset int) {
	for i, r := range line {
		if !isJSSpace(r) {
			return depth, i
		}
		depth++
	}
	return depth, len(line)
}

// isBlank reports whether s is empty or consists solely of ECMAScript space.
func isBlank(s string) bool {
	_, offset := measureIndent(s)
	return offset == len(s)
}
