// internal/slug/reserved.go
// Package slug: centralizes every reserved-word list and its
// case-insensitive lookup. Adding a new reserved-name check (a new
// collection whose field must avoid colliding with a route) means
// adding one map and one thin wrapper here -- the comparison rule
// itself ("exact match once lowercased") lives in this file only.
package slug

import "strings"

// cardTitleReserved is the set of card titles FromTitle must never
// produce, since they collide with a static route (see
// frontend/src/lib/router.tsx's "/:slug/new").
var cardTitleReserved = map[string]bool{
	"new": true,
}

// potNameReserved is the set of pot names that must be rejected,
// since they collide with a static frontend route or a top-level API
// path segment (see frontend/src/lib/router.tsx's route table and
// internal/serve/handler.go's "/api/..." route groups).
var potNameReserved = map[string]bool{
	"pots":     true,
	"api":      true,
	"admin":    true,
	"settings": true,
	"_":        true,
}

// isReservedWord reports whether value, compared case-insensitively,
// is exactly one of the words in reserved. It performs no other
// normalization: a value that merely contains a reserved word (e.g.
// "News" against {"new"}) is not itself reserved -- only an exact
// match is.
func isReservedWord(reserved map[string]bool, value string) bool {
	return reserved[strings.ToLower(value)]
}

// IsReserved reports whether title is a reserved card title ("new",
// "New", "NEW", ... -- 8 case variants in all). Used by the "cards"
// collection's OnRecordValidate hook (see internal/serve/validate.go)
// to reject a card title that would otherwise collide with a
// reserved route segment.
func IsReserved(title string) bool {
	return isReservedWord(cardTitleReserved, title)
}

// IsReservedPotName reports whether name is a reserved pot name,
// compared case-insensitively (so "PoTs", "ApI", etc. are rejected
// too). Used by the "pots" collection's OnRecordValidate hook (see
// internal/serve/validate.go) to reject a pot name that would
// otherwise collide with a static route or API path segment.
func IsReservedPotName(name string) bool {
	return isReservedWord(potNameReserved, name)
}
