package serve

import "testing"

func TestRenameLinks_ReplacesLinksAndSyncsDerivedData(t *testing.T) {
	app := newImportTestApp(t)
	pot := createPot(t, app, "pot1")
	// "New" is a reserved title (see slug.IsReserved) and would be imported as
	// "New_", so the renamed card uses an ordinary one.
	runImport(t, app, "pot1", `{"pages":[
		{"title":"Fresh","lines":["Fresh","own text"]},
		{"title":"B","lines":["B","see [Old] and #old"]},
		{"title":"C","lines":["C","[other]"]}
	]}`)
	yjsServer = nil // no room is loaded: every card is read from its stored log

	renamed := cardInPot(t, app, pot.Id, "fresh")
	updated, err := renameLinks(app, renamed, "Old")
	if err != nil {
		t.Fatalf("renameLinks: %v", err)
	}
	if updated != 1 {
		t.Errorf("updated = %d, want 1", updated)
	}

	b := cardInPot(t, app, pot.Id, "b")
	if got, want := cardText(t, app, b.Id), "B\nsee [Fresh] and #Fresh"; got != want {
		t.Errorf("text of B = %q, want %q", got, want)
	}
	if got, want := b.GetString("description"), `["see [Fresh] and #Fresh"]`; got != want {
		t.Errorf("description of B = %q, want %q", got, want)
	}
	links, err := ownTargetTitleLcs(app, b.Id)
	if err != nil {
		t.Fatalf("ownTargetTitleLcs: %v", err)
	}
	if len(links) != 1 || links[0] != "fresh" {
		t.Errorf("links of B = %v, want [fresh]", links)
	}

	c := cardInPot(t, app, pot.Id, "c")
	if got, want := cardText(t, app, c.Id), "C\n[other]"; got != want {
		t.Errorf("text of C = %q, want %q", got, want)
	}
}

func TestRenameLinks_CaseOnlyChangeDoesNothing(t *testing.T) {
	app := newImportTestApp(t)
	pot := createPot(t, app, "pot1")
	runImport(t, app, "pot1", `{"pages":[
		{"title":"Fresh","lines":["Fresh"]},
		{"title":"B","lines":["B","[fresh]"]}
	]}`)
	yjsServer = nil

	updated, err := renameLinks(app, cardInPot(t, app, pot.Id, "fresh"), "FRESH")
	if err != nil {
		t.Fatalf("renameLinks: %v", err)
	}
	if updated != 0 {
		t.Errorf("updated = %d, want 0", updated)
	}
}
