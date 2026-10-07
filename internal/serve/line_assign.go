package serve

import (
	"hash/fnv"
	"strconv"
	"strings"
)

// lineEntry is one line of a card: a stable id and a hash of its content. The
// order of a card's entries is the order of its lines.
type lineEntry struct {
	ID   string `json:"id"`
	Hash string `json:"hash"`
}

// lineHashes splits text into lines the way CodeMirror does (a trailing
// newline is an empty last line) and returns the hash of each.
func lineHashes(text string) []string {
	lines := strings.Split(text, "\n")
	hashes := make([]string, len(lines))
	for i, line := range lines {
		h := fnv.New64a()
		_, _ = h.Write([]byte(line))
		hashes[i] = strconv.FormatUint(h.Sum64(), 36)
	}
	return hashes
}

// assignLineIDs returns the entries of the new lines, given the previous
// entries and the hashes of the new lines. Pure: newID supplies fresh ids.
//
// Lines that are unchanged at the start and at the end keep their ids. The
// changed lines in between keep the ids of the previous lines at the same
// position, and any extra line gets a new id. So editing a line, or pressing
// Enter in it, keeps the id of the upper line; a moved line gets a new id.
func assignLineIDs(prev []lineEntry, hashes []string, newID func() string) []lineEntry {
	out := make([]lineEntry, len(hashes))

	start := 0
	for start < len(prev) && start < len(hashes) && prev[start].Hash == hashes[start] {
		out[start] = prev[start]
		start++
	}

	prevEnd, newEnd := len(prev), len(hashes)
	for prevEnd > start && newEnd > start && prev[prevEnd-1].Hash == hashes[newEnd-1] {
		prevEnd--
		newEnd--
		out[newEnd] = prev[prevEnd]
	}

	// Each previous entry is used at most once: start, the middle and the
	// tail are disjoint ranges of prev.
	for k := start; k < newEnd; k++ {
		id := ""
		if k < prevEnd {
			id = prev[k].ID
		} else {
			id = newID()
		}
		out[k] = lineEntry{ID: id, Hash: hashes[k]}
	}
	return out
}
