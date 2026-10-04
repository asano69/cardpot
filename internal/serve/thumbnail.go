// thumbnail.go picks a card's thumbnail (the "image" field) from its text:
// the first image or mermaid diagram in document order. A diagram is rendered
// to SVG on the server and stored in the "renders" collection, keyed by a hash
// of its source, so the same diagram is rendered once however many cards use
// it. The card's image is then the URL PocketBase serves that file under.
package serve

import (
	"crypto/sha256"
	"database/sql"
	"encoding/hex"
	"errors"
	"fmt"
	"log/slog"
	"strings"

	mermaid "github.com/zkrebbekx/go-mermaid"

	"github.com/pocketbase/dbx"
	"github.com/pocketbase/pocketbase/core"
	"github.com/pocketbase/pocketbase/tools/filesystem"

	"github.com/asano69/cardpot/internal/parser"
)

const (
	// rendersKindMermaid is the "kind" of a render made from a mermaid block.
	rendersKindMermaid = "mermaid"
	// The server draws one SVG per diagram, so it cannot follow the viewer's
	// light/dark mode. A white background is baked in to keep a thumbnail
	// readable on either card color.
	mermaidTheme      = mermaid.Default
	mermaidBackground = "#ffffff"
)

// thumbnailSrc returns the thumbnail of a note: the first image or mermaid
// diagram in document order, or "" when there is none. A diagram that cannot
// be rendered (go-mermaid supports fewer diagram types than the editor's
// mermaid.js) is skipped, so a later image can still be used.
func thumbnailSrc(app core.App, note *parser.Note) string {
	src := ""
	note.Walk(func(n *parser.Node) bool {
		switch {
		case n.Kind == parser.KindImage || n.Kind == parser.KindLinkedImage:
			src = n.Text
		case n.IsMermaid() && strings.TrimSpace(n.BodyText()) != "":
			url, err := mermaidThumbnailURL(app, n.BodyText())
			if err != nil {
				slog.Warn("render mermaid thumbnail", "error", err)
				return true
			}
			src = url
		}
		return src == ""
	})
	return src
}

// mermaidThumbnailURL returns the URL of the SVG of a mermaid source,
// rendering and storing it first when no render of it exists yet.
func mermaidThumbnailURL(app core.App, source string) (string, error) {
	hash := renderHash(rendersKindMermaid, string(mermaidTheme), source)

	record, err := app.FindFirstRecordByFilter(
		"renders", "kind = {:kind} && content_hash = {:hash}",
		dbx.Params{"kind": rendersKindMermaid, "hash": hash},
	)
	if errors.Is(err, sql.ErrNoRows) {
		record, err = createMermaidRender(app, hash, source)
	}
	if err != nil {
		return "", err
	}
	return "/api/files/" + record.BaseFilesPath() + "/" + record.GetString("output_file"), nil
}

// createMermaidRender renders source to SVG and saves it as a new "renders"
// record whose content_hash is hash.
func createMermaidRender(app core.App, hash, source string) (*core.Record, error) {
	svg, err := mermaid.Render(source,
		mermaid.WithTheme(mermaidTheme),
		mermaid.WithBackground(mermaidBackground),
	)
	if err != nil {
		return nil, fmt.Errorf("render mermaid: %w", err)
	}
	file, err := filesystem.NewFileFromBytes(svg, "mermaid.svg")
	if err != nil {
		return nil, fmt.Errorf("make render file: %w", err)
	}
	collection, err := app.FindCollectionByNameOrId("renders")
	if err != nil {
		return nil, err
	}

	record := core.NewRecord(collection)
	record.Set("kind", rendersKindMermaid)
	record.Set("content_hash", hash)
	record.Set("output_file", file)
	if err := app.Save(record); err != nil {
		return nil, fmt.Errorf("save render: %w", err)
	}
	return record, nil
}

// renderHash identifies a render by everything that affects its output. The
// NUL separators keep ("a", "bc") and ("ab", "c") from hashing alike.
func renderHash(kind, theme, source string) string {
	sum := sha256.Sum256([]byte(kind + "\x00" + theme + "\x00" + source))
	return hex.EncodeToString(sum[:])
}
