// Package datalog answers link-graph queries (e.g. links2hop) by evaluating
// Mangle rules over facts derived from the "card_links" collection.
package datalog

import (
	_ "embed"
	"fmt"
	"io"
	"strings"
	"sync"

	"github.com/google/mangle/ast"
	"github.com/google/mangle/factstore"
	"github.com/google/mangle/interpreter"
	"github.com/google/mangle/parse"
	"github.com/pocketbase/pocketbase/core"
)

//go:embed rules.mg
var defaultRules string

// Engine holds a Mangle interpreter whose fixed point has already been
// computed, so queries are answered without re-evaluating the rules.
type Engine struct {
	mu     sync.Mutex // not sure the interpreter is goroutine-safe; keep it simple
	interp *interpreter.Interpreter
}

// Load reads every "card_links" record once, turns it into facts and
// evaluates the rules. The engine is NOT updated when card_links changes
// afterwards (test stage only).
func Load(app core.App) (*Engine, error) {
	links, err := app.FindRecordsByFilter("card_links", "", "", 0, 0, nil)
	if err != nil {
		return nil, fmt.Errorf("load card_links: %w", err)
	}

	store := factstore.NewSimpleInMemoryStore()
	for _, link := range links {
		store.Add(ast.NewAtom("link",
			ast.String(link.GetString("target_pot")),
			ast.String(link.GetString("source")),
			ast.String(link.GetString("target_titleLc")),
		))
	}

	unit, err := parse.Unit(strings.NewReader(defaultRules))
	if err != nil {
		return nil, fmt.Errorf("parse rules: %w", err)
	}
	interp := interpreter.New(io.Discard, ".", nil)
	if err := interp.Preload([]parse.SourceUnit{unit}, store, map[ast.PredicateSym]ast.Decl{}); err != nil {
		return nil, fmt.Errorf("evaluate rules: %w", err)
	}
	return &Engine{interp: interp}, nil
}

// Links2Hop returns the ids of the cards that share a link target with cardID.
func (e *Engine) Links2Hop(cardID string) ([]string, error) {
	e.mu.Lock()
	defer e.mu.Unlock()

	// Built as text and parsed, the same way datalog-poc does. Card ids are
	// [a-z0-9]{15}, so quoting them with %q cannot break the query.
	query, err := e.interp.ParseQuery(fmt.Sprintf("links2hop(%q, B)", cardID))
	if err != nil {
		return nil, fmt.Errorf("parse links2hop query: %w", err)
	}
	facts, err := e.interp.Query(query)
	if err != nil {
		return nil, fmt.Errorf("query links2hop: %w", err)
	}
	ids := make([]string, 0, len(facts))
	for _, fact := range facts {
		id, err := fact.Args[1].(ast.Constant).StringValue()
		if err != nil {
			return nil, fmt.Errorf("read links2hop result: %w", err)
		}
		ids = append(ids, id)
	}
	return ids, nil
}
