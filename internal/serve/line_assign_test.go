package serve

import (
	"fmt"
	"slices"
	"testing"
)

// entries builds entries whose id is "<hash>" uppercased by position, so a
// test reads as "line a has id A".
func entries(pairs ...string) []lineEntry {
	var out []lineEntry
	for i := 0; i < len(pairs); i += 2 {
		out = append(out, lineEntry{ID: pairs[i], Hash: pairs[i+1]})
	}
	return out
}

func ids(es []lineEntry) []string {
	out := make([]string, len(es))
	for i, e := range es {
		out[i] = e.ID
	}
	return out
}

func counter() func() string {
	n := 0
	return func() string { n++; return fmt.Sprintf("new%d", n) }
}

func TestAssignLineIDs(t *testing.T) {
	prev := entries("A", "a", "B", "b", "C", "c")
	cases := []struct {
		name   string
		hashes []string
		want   []string
	}{
		{"unchanged", []string{"a", "b", "c"}, []string{"A", "B", "C"}},
		{"edit a middle line", []string{"a", "b2", "c"}, []string{"A", "B", "C"}},
		{"insert a line", []string{"a", "x", "b", "c"}, []string{"A", "new1", "B", "C"}},
		{"split a line (upper keeps the id)", []string{"a", "b1", "b2", "c"}, []string{"A", "B", "new1", "C"}},
		{"delete a line", []string{"a", "c"}, []string{"A", "C"}},
		{"append at the end", []string{"a", "b", "c", "d"}, []string{"A", "B", "C", "new1"}},
		{"everything replaced", []string{"x", "y"}, []string{"A", "B"}},
		{"empty to something", []string{"x"}, []string{"A"}},
	}
	for _, tt := range cases {
		t.Run(tt.name, func(t *testing.T) {
			got := ids(assignLineIDs(prev, tt.hashes, counter()))
			if !slices.Equal(got, tt.want) {
				t.Errorf("ids = %v, want %v", got, tt.want)
			}
		})
	}
}

func TestAssignLineIDs_NoPreviousLines(t *testing.T) {
	got := assignLineIDs(nil, []string{"a", "b"}, counter())
	if want := []string{"new1", "new2"}; !slices.Equal(ids(got), want) {
		t.Errorf("ids = %v, want %v", ids(got), want)
	}
}

func TestAssignLineIDs_NeverRepeatsAnID(t *testing.T) {
	prev := entries("A", "a", "B", "b", "C", "c", "D", "d")
	got := ids(assignLineIDs(prev, []string{"a", "x", "y", "z", "w", "d"}, counter()))
	seen := map[string]bool{}
	for _, id := range got {
		if seen[id] {
			t.Fatalf("id %q is used twice in %v", id, got)
		}
		seen[id] = true
	}
}

func TestLineHashes_MatchesCodeMirrorLineCount(t *testing.T) {
	if got := len(lineHashes("a\nb\n")); got != 3 {
		t.Errorf("got %d lines, want 3 (a trailing newline starts an empty last line)", got)
	}
	if got := len(lineHashes("")); got != 1 {
		t.Errorf("got %d lines, want 1", got)
	}
}
