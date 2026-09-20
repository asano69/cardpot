//go:build ignore

package notation

import "unicode/utf8"

// isJSSpace reports whether r matches ECMAScript's `\s`, which is the
// definition of whitespace (and therefore of one indent level) shared with the
// frontend (see parser/cardpot/indent.ts). unicode.IsSpace is NOT equivalent:
// it accepts U+0085 and rejects U+FEFF.
func isJSSpace(r rune) bool {
	switch r {
	case '\t', '\n', '\v', '\f', '\r', ' ',
		0x00A0, 0x1680, 0x2028, 0x2029, 0x202F, 0x205F, 0x3000, 0xFEFF:
		return true
	}
	return r >= 0x2000 && r <= 0x200A
}

// leadingIndent returns the size of s's leading whitespace run, both in bytes
// and in runes. The frontend measures indentation in characters, so the rune
// count is the indent depth.
func leadingIndent(s []byte) (byteLen, runeLen int) {
	for byteLen < len(s) {
		r, size := utf8.DecodeRune(s[byteLen:])
		if !isJSSpace(r) {
			break
		}
		byteLen += size
		runeLen++
	}
	return byteLen, runeLen
}

// isBlank reports whether s holds nothing but whitespace (or is empty).
func isBlank(s []byte) bool {
	n, _ := leadingIndent(s)
	return n == len(s)
}

// byteOffsetAfterRunes returns the byte offset just past the first n runes of s.
func byteOffsetAfterRunes(s []byte, n int) int {
	off := 0
	for ; n > 0 && off < len(s); n-- {
		_, size := utf8.DecodeRune(s[off:])
		off += size
	}
	return off
}

// trimEOL removes one trailing "\n" or "\r\n".
func trimEOL(line []byte) []byte {
	if n := len(line); n > 0 && line[n-1] == '\n' {
		line = line[:n-1]
		if n := len(line); n > 0 && line[n-1] == '\r' {
			line = line[:n-1]
		}
	}
	return line
}
