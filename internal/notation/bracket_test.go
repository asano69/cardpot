package notation

import "testing"

// Cases mirror frontend/src/features/noteEditor/parser/cardpot/index.test.ts
// and cosy's parser/bracket/*.rs tests.
func TestDecideBracketKind(t *testing.T) {
	cases := []struct {
		content string
		want    BracketKind
	}{
		{"$ x + [y]", KindMath},
		{"me.icon", KindIcon},
		{"me.icon*3", KindIcon},
		{"user.icon*0", KindWikiLink}, // count must be >= 1
		{".icon", KindWikiLink},       // name must be non-empty
		{"/project/page", KindProjectLink},
		{"/project", KindProjectLink},
		{"N35.68,E139.76,Z14", KindGoogleMap},
		{"N,E", KindWikiLink},
		{"page", KindWikiLink},
		{"a b", KindWikiLink},
		{"a [b] c", KindWikiLink},
		{"https://example.com/", KindExternalLink},
		{"https://example.com/a.png", KindImage},
		{"https://gyazo.com/0f82099330f378fe4917a1b4a5fe8815", KindImage},
		{"https://example.com/a.png https://example.com/", KindLinkedImage},
		{"https://example.com/ https://example.com/a.png", KindLinkedImage},
		{"label https://example.com/", KindExternalLink},
		{"https://example.com/ label", KindExternalLink},
		{"https://example.com/ label [page]", KindExternalLink},
		// An image URL followed by a plain label is not a link at all.
		{"https://example.com/a.png label", KindWikiLink},
		// Only exactly two URL tokens make a linked image.
		{"https://example.com/a.png mid https://example.com/", KindExternalLink},
	}
	for _, c := range cases {
		if got := DecideBracketKind(c.content); got != c.want {
			t.Errorf("DecideBracketKind(%q) = %q, want %q", c.content, got, c.want)
		}
	}
}
