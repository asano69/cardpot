package parser

import (
	"slices"
	"testing"
)

const testTitle = "T\n"

func TestParseWikiLinkTitles(t *testing.T) {
	cases := []struct {
		name string
		text string
		want []string
	}{
		{"plain, duplicate, and Unicode", testTitle + "[page] [page] [日本語]", []string{"page", "page", "日本語"}},
		{"title is raw text", "[not a link]\n[page]", []string{"page"}},
		{"inline code", testTitle + "`[hidden]` [shown]", []string{"shown"}},
		{"code block", testTitle + "before [a]\ncode:x\n\t[hidden]\nafter [b]", []string{"a", "b"}},
		{"decoration and strong", testTitle + "[* [a]] [[strong [b]]] [[https://example.com/a.png]] [[me.icon]]", []string{"a", "b"}},
		{"bracket kinds are not links", testTitle + "[ ] [$ x] [me.icon] [/project/a] [N35.6,E139.7] [https://example.com/] [https://example.com/a.png]", nil},
		{"nested and malformed brackets", testTitle + "[a [b] c] [unterminated [page]", []string{"a [b] c", "page"}},
	}
	for _, tt := range cases {
		t.Run(tt.name, func(t *testing.T) {
			if got := Parse(tt.text).WikiLinkTitles(); !slices.Equal(got, tt.want) {
				t.Errorf("WikiLinkTitles() = %q, want %q", got, tt.want)
			}
		})
	}
}

func TestTitleAndBlocks(t *testing.T) {
	cases := []struct {
		name, text, title, tree string
	}{
		{"raw title", "  [raw]\n[page]", "  [raw]", "Document(Title,Line(WikiLink))"},
		{"blank first line has no title", " \u3000\n[page]", "", "Document(Line(WikiLink))"},
		{"code title stays title", "code:x\n\t[page]", "code:x", "Document(Title,Line(WikiLink))"},
		{"blank line ends code", testTitle + "code:x\n\t[hidden]\n\n[shown]", "T", "Document(Title,CodeBlock,Line(WikiLink))"},
	}
	for _, tt := range cases {
		t.Run(tt.name, func(t *testing.T) {
			note := Parse(tt.text)
			if got := note.Title(); got != tt.title {
				t.Errorf("Title() = %q, want %q", got, tt.title)
			}
			if got := note.String(); got != tt.tree {
				t.Errorf("String() = %q, want %q", got, tt.tree)
			}
		})
	}
}

func TestFirstImageSrc(t *testing.T) {
	cases := []struct{ text, want string }{
		{testTitle + "[https://example.com/a.png]", "https://example.com/a.png"},
		{testTitle + "[https://example.com/a.png https://example.com/b.jpg]", "https://example.com/a.png"},
		{testTitle + "[[https://example.com/a.png]]", "https://example.com/a.png"},
		{testTitle + "`[https://example.com/a.png]` [https://example.com/b.webp]", "https://example.com/b.webp"},
		{"[https://example.com/title.png]\n[https://example.com/body.gif]", "https://example.com/body.gif"},
	}
	for _, tt := range cases {
		if got := Parse(tt.text).FirstImageSrc(); got != tt.want {
			t.Errorf("FirstImageSrc(%q) = %q, want %q", tt.text, got, tt.want)
		}
	}
}

func TestImageWithExtensionInQuery(t *testing.T) {
	const src = "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTr7Q2-iOUXeta4efD3d8FAPLTOfSN1lKRhOGJInoa6mA&s=10.png"

	if got := DecideBracket(src); got.Kind != KindImage || got.Src != src {
		t.Errorf("DecideBracket() = %#v, want Kind=%q Src=%q", got, KindImage, src)
	}
	if got := Parse(testTitle + "[" + src + "]").FirstImageSrc(); got != src {
		t.Errorf("FirstImageSrc() = %q, want %q", got, src)
	}
}

func TestWalkCanStop(t *testing.T) {
	count := 0
	finished := Parse(testTitle + "[a] [b]").Walk(func(*Node) bool {
		count++
		return false
	})
	if finished || count != 1 {
		t.Fatalf("Walk() = (%v, %d), want (false, 1)", finished, count)
	}
}
