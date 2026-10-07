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
// Lines that are unchanged at the start and at the end keep their ids. In
// between, lines that appear unchanged in both versions (see matchLines) keep
// their ids too, so a moved line is recognized. The lines between those
// anchors keep the ids of the previous lines at the same position, and any
// extra line gets a new id. So editing a line, or pressing Enter in it, keeps
// the id of the upper line.
//
// Only the text is known here, not the operation that produced it, so two
// operations with the same result cannot be told apart: swapping two lines
// keeps the id of the lower line, whichever of the two was moved. The ids of
// removed lines are forgotten and never handed out again.
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

	// fill pairs the previous entries prev[pFrom:pTo] with the new lines
	// hashes[nFrom:nTo] by position. Extra new lines get a new id.
	fill := func(pFrom, pTo, nFrom, nTo int) {
		for k := nFrom; k < nTo; k++ {
			var id string
			if p := pFrom + k - nFrom; p < pTo {
				id = prev[p].ID
			} else {
				id = newID()
			}
			out[k] = lineEntry{ID: id, Hash: hashes[k]}
		}
	}

	// Each previous entry is used at most once: start, the anchors, the gaps
	// between them and the tail are disjoint ranges of prev.
	p, n := start, start
	for _, m := range matchLines(prev[start:prevEnd], hashes[start:newEnd]) {
		mp, mn := start+m[0], start+m[1]
		fill(p, mp, n, mn)
		out[mn] = prev[mp]
		p, n = mp+1, mn+1
	}
	fill(p, prevEnd, n, newEnd)
	return out
}

// maxLCSCells bounds the size of matchLines' table (rows x columns). A middle
// section larger than this, e.g. a whole card replaced by a paste, is paired
// by position only instead of using a lot of memory.
const maxLCSCells = 1_000_000

// matchLines returns the pairs (i, j), in increasing order, of a longest
// common subsequence of prev's hashes and hashes: prev[i] and hashes[j] are
// the same line. When several subsequences are equally long, the one that
// keeps the later of two swapped lines is chosen.
func matchLines(prev []lineEntry, hashes []string) [][2]int {
	if len(prev)*len(hashes) > maxLCSCells {
		return nil
	}
	cols := len(hashes) + 1
	// length[i*cols+j] is the length of the LCS of prev[i:] and hashes[j:].
	length := make([]int32, (len(prev)+1)*cols)
	for i := len(prev) - 1; i >= 0; i-- {
		for j := len(hashes) - 1; j >= 0; j-- {
			if prev[i].Hash == hashes[j] {
				length[i*cols+j] = length[(i+1)*cols+j+1] + 1
			} else {
				length[i*cols+j] = max(length[(i+1)*cols+j], length[i*cols+j+1])
			}
		}
	}

	var pairs [][2]int
	for i, j := 0, 0; i < len(prev) && j < len(hashes); {
		switch {
		case prev[i].Hash == hashes[j]:
			pairs = append(pairs, [2]int{i, j})
			i++
			j++
		case length[(i+1)*cols+j] >= length[i*cols+j+1]:
			i++
		default:
			j++
		}
	}
	return pairs
}
