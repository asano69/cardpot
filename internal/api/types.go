// Package api defines the JSON shapes of the custom API routes.
// tygo turns this package into frontend/src/lib/api/generated.ts
// (see tygo.yaml), so the frontend types cannot drift from these.
package api

import "github.com/pocketbase/pocketbase/tools/types"

// CreateCardRequest is the body of POST /api/admin/cards.
type CreateCardRequest struct {
	Pot            string         `json:"pot"`
	TitleCandidate TitleCandidate `json:"titleCandidate" tstype:"TitleCandidate"`
}

// UpdateCardTitleRequest is the body of POST /api/admin/cards/{id}/title.
type UpdateCardTitleRequest struct {
	TitleCandidate TitleCandidate `json:"titleCandidate" tstype:"TitleCandidate"`
}

// LinkedCard is one card entry in the links1hop / links2hop responses.
type LinkedCard struct {
	Title   CardTitle `json:"title" tstype:"CardTitle"`
	TitleLc string    `json:"titleLc"`
	// Raw JSON as stored in the "description" field (a list of lines).
	Description   types.JSONRaw `json:"description" tstype:"string[] | null"`
	Image         string        `json:"image"`
	Pin           bool          `json:"pin"`
	TargetTitleLc []string      `json:"target_titleLc" tstype:"string[]"`
}

// Link2HopCard is one row of the links2hop response: a card that links to
// the shared target (ViaTitle), which the open card links to as well. A card
// sharing several targets appears once per target. Rows of the same target
// are adjacent, in the order the targets appear in the open card.
type Link2HopCard struct {
	LinkedCard `tstype:",extends"`
	ViaTitle   string `json:"via_title"`
	ViaTitleLc string `json:"via_titleLc"`
}
