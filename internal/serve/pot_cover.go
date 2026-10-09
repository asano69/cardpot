// pot_cover.go gives every pot a generated cover image, so the pot grid does
// not have to fall back to the app logo. This is a provisional default: a
// cover the user uploads replaces it and is never overwritten afterwards.
package serve

import (
	"bytes"

	"io"
	"log/slog"

	"github.com/pocketbase/pocketbase/core"
	"github.com/pocketbase/pocketbase/tools/filesystem"
	"github.com/sig-0/boring-avatars-go/avatars"
)

// coverSize is the width and height of the generated SVG, in pixels.
const coverSize = 240

// coverPalette is the bauhaus palette used for generated covers.
var coverPalette = []string{"#00686c", "#32c2b9", "#edecb3", "#fad928", "#ff9915"}

// coverSVG returns the generated cover for a pot title. It is deterministic,
// so the same title always gives the same bytes.
func coverSVG(title string) []byte {
	return []byte(avatars.Generate(avatars.Bauhaus, title, coverPalette, coverSize, true))
}

// NewCoverFile wraps the generated cover of title as a file to store. It is
// exported for scripts/regenerate_pot_covers.
func NewCoverFile(title string) (*filesystem.File, error) {
	return filesystem.NewFileFromBytes(coverSVG(title), "cover.svg")
}

// isGeneratedCover reports whether the stored cover of pot is exactly what we
// would have generated for title. Comparing the content (not the file name)
// is what tells our image from one the user uploaded.
func isGeneratedCover(app core.App, pot *core.Record, title string) (bool, error) {
	fsys, err := app.NewFilesystem()
	if err != nil {
		return false, err
	}
	defer fsys.Close()

	reader, err := fsys.GetReader(pot.BaseFilesPath() + "/" + pot.GetString("cover"))
	if err != nil {
		return false, err
	}
	defer reader.Close()

	stored, err := io.ReadAll(reader)
	if err != nil {
		return false, err
	}
	return bytes.Equal(stored, coverSVG(title)), nil
}

// registerPotCoverHooks generates the cover of a new pot that has none, and
// regenerates it when the title changes, but only while the current cover is
// still a generated one. A failure is only logged: it must never prevent the
// pot from being saved.
func registerPotCoverHooks(app core.App) {
	app.OnRecordCreate("pots").BindFunc(func(e *core.RecordEvent) error {
		if e.Record.GetString("cover") == "" && len(e.Record.GetUnsavedFiles("cover")) == 0 {
			setGeneratedCover(e.Record)
		}
		return e.Next()
	})

	app.OnRecordUpdate("pots").BindFunc(func(e *core.RecordEvent) error {
		if shouldRegenerateCover(e) {
			setGeneratedCover(e.Record)
		}
		return e.Next()
	})
}

// shouldRegenerateCover decides whether an update must replace the cover.
func shouldRegenerateCover(e *core.RecordEvent) bool {
	original := e.Record.Original()
	oldTitle, newTitle := original.GetString("title"), e.Record.GetString("title")
	if oldTitle == newTitle {
		return false
	}
	// The user is changing the cover in this very request: leave it alone.
	if len(e.Record.GetUnsavedFiles("cover")) > 0 ||
		e.Record.GetString("cover") != original.GetString("cover") {
		return false
	}
	if original.GetString("cover") == "" {
		return true
	}
	generated, err := isGeneratedCover(e.App, original, oldTitle)
	if err != nil {
		slog.Warn("check pot cover", "pot", e.Record.Id, "error", err)
		return false
	}
	return generated
}

// setGeneratedCover sets the pot's cover to the generated image of its title.
// Setting a new file on a single-file field replaces (and deletes) the old one.
func setGeneratedCover(pot *core.Record) {
	file, err := NewCoverFile(pot.GetString("title"))
	if err != nil {
		slog.Warn("make pot cover", "pot", pot.Id, "error", err)
		return
	}
	pot.Set("cover", file)
}
