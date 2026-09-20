package notation

import (
	"slices"
	"testing"
)

// The first line of a card is its title and is never scanned, so most cases
// place a throwaway title line above the body under test.
const titleLine = "T\n"

func TestExtractWikiLinkTitles(t *testing.T) {
	cases := []struct {
		name string
		text string
		want []string
	}{
		{"plain link", titleLine + "plain [page] [* bold] `code`", []string{"page"}},
		{"title line is skipped", "[not a link]\n[page]", []string{"page"}},
		{"code: on the title line opens no block", "code: notes\n\t[page]", []string{"page"}},
		{"duplicates are kept", titleLine + "[a] [a]", []string{"a", "a"}},
		{"non-ASCII", titleLine + "[日本語] and [ページ]", []string{"日本語", "ページ"}},

		// Code.
		{"inline code", titleLine + "`[a]` [b]", []string{"b"}},
		{"unterminated backtick", titleLine + "` [a]", []string{"a"}},
		{"code block until indent returns",
			titleLine + "before [a]\ncode:ts\n\t[not-a-link]\n\tconst x = 1\nafter [b]",
			[]string{"a", "b"}},
		{"indented code block", titleLine + "\tcode:main.rs\n\t\t[x]\n\t[y]", []string{"y"}},
		{"blank line ends code block", titleLine + "code:x\n\t[in]\n\n[out]", []string{"out"}},
		{"any whitespace counts as indent",
			titleLine + " code:js\n  const x = [a]\n\u3000\u3000[b]\nafter [c]",
			[]string{"c"}},

		// Decoration, blank, strong.
		{"decoration", titleLine + "[* [Link] text]", []string{"Link"}},
		{"combined decoration", titleLine + "[*/ [Link]]", []string{"Link"}},
		{"asterisks without a space are a link", titleLine + "[**]", []string{"**"}},
		{"blanks", titleLine + "[ ] [\u3000] [\t] [page]", []string{"page"}},
		{"strong", titleLine + "[[strong [page]]] [[https://example.com/a.png]] [[me.icon]]", []string{"page"}},
		{"unterminated strong", titleLine + "[[]] [[unterminated]", []string{"unterminated"}},

		// Other bracket kinds are not wiki links.
		{"other kinds",
			titleLine + "[$ x + [y]] [me.icon*3] [/project/page] [N35.68,E139.76,Z14] [https://example.com/] [https://example.com/a.png]",
			nil},
		{"nested brackets", titleLine + "[a [b] c] [unterminated [page]", []string{"a [b] c", "page"}},
		// Known divergence: a labelled external link's label is not scanned.
		{"external link label", titleLine + "[https://example.com/ see [page]]", nil},

		// Blocks whose content is scanned like any other line.
		{"table cells", titleLine + "table:x\n\t[a]\t[b]", []string{"a", "b"}},
		{"quote", titleLine + "> [a] `[b]`", []string{"a"}},
	}
	for _, c := range cases {
		t.Run(c.name, func(t *testing.T) {
			if got := ExtractWikiLinkTitles(c.text); !slices.Equal(got, c.want) {
				t.Errorf("ExtractWikiLinkTitles(%q) = %q, want %q", c.text, got, c.want)
			}
		})
	}
}
