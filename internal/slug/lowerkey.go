package slug

import "strings"

// ToLowerKey derives a card's "titleLc" search key from its title:
// every letter is lowercased and every half-width space becomes an
// underscore. This is deliberately independent of FromTitle -- it
// does not treat brackets as word separators or collapse consecutive
// separators the way a slug does -- since titleLc exists purely for
// case-insensitive search, not as a URL segment. PocketBase has no
// generated columns, so callers must compute and store this value
// themselves whenever title changes (see internal/serve/cards.go and
// title_watch.go).
func ToLowerKey(title string) string {
	return strings.ToLower(strings.ReplaceAll(title, " ", "_"))
}
