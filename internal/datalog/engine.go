// Package datalog answers link-graph queries (e.g. links2hop) by evaluating
// Mangle rules over facts derived from the "card_links" collection.
package datalog

import (
	_ "embed"
	"errors"
	"fmt"
	"io"
	"log/slog"
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

	cards, err := app.FindRecordsByFilter("cards", `deleted = ""`, "", 0, 0, nil)
	if err != nil {
		return nil, fmt.Errorf("load cards: %w", err)
	}
	for _, card := range cards {
		store.Add(ast.NewAtom("card_title",
			ast.String(card.GetString("pot")),
			ast.String(card.Id),
			ast.String(card.GetString("titleLc")),
		))
	}

	slog.Info("datalog: loaded link facts", "count", len(links))

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
	return e.related("links2hop", cardID)
}

// Links1Hop returns the ids of the cards that link to, or are linked from, cardID.
func (e *Engine) Links1Hop(cardID string) ([]string, error) {
	return e.related("links1hop", cardID)
}

// related returns B for every fact pred(cardID, B).
func (e *Engine) related(pred, cardID string) ([]string, error) {
	// Built as text and parsed, the same way datalog-poc does. Card ids are
	// [a-z0-9]{15}, so quoting them with %q cannot break the query.
	return e.Query(fmt.Sprintf("%s(%q, B)", pred, cardID))
}

// Query evaluates a single-atom query such as `links1hop("abc", B)` and
// returns, for every result, the value of the query's first variable
// argument. The result values are expected to be card ids.
func (e *Engine) Query(text string) ([]string, error) {
	e.mu.Lock()
	defer e.mu.Unlock()

	query, err := e.interp.ParseQuery(text)
	if err != nil {
		return nil, fmt.Errorf("parse query: %w", err)
	}
	varIndex := -1
	for i, arg := range query.Args {
		if _, ok := arg.(ast.Variable); ok {
			varIndex = i
			break
		}
	}
	if varIndex < 0 {
		return nil, errors.New(`query needs a variable argument, e.g. links1hop("<card id>", B)`)
	}

	facts, err := e.interp.Query(query)
	if err != nil {
		return nil, fmt.Errorf("run query: %w", err)
	}
	slog.Info("datalog: query", "query", text, "results", len(facts))
	ids := make([]string, 0, len(facts))
	for _, fact := range facts {
		constant, ok := fact.Args[varIndex].(ast.Constant)
		if !ok {
			return nil, errors.New("query result is not a constant")
		}
		id, err := constant.StringValue()
		if err != nil {
			return nil, fmt.Errorf("read query result: %w", err)
		}
		ids = append(ids, id)
	}
	return ids, nil
}
