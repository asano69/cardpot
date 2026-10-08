// pot_cover.go gives every pot a generated cover image, so the pot grid does
// not have to fall back to the app logo. This is a provisional default: a
// cover the user uploads replaces it and is never overwritten afterwards.
package serve

import (
	"bytes"
	"fmt"
	"hash/fnv"
	"io"
	"log/slog"
	"math"

	"github.com/pocketbase/pocketbase/core"
	"github.com/pocketbase/pocketbase/tools/filesystem"
	"github.com/sig-0/boring-avatars-go/avatars"
)

// coverSize is the width and height of the generated SVG, in pixels.
const coverSize = 240

// coverLightness is the lightness of each of the five palette colors. The
// alternation keeps neighboring shapes from blending into each other.
var coverLightness = [5]float64{0.35, 0.70, 0.50, 0.80, 0.60}

// coverPalette derives a five color palette from the pot title: the hash of
// the title picks the first hue, how far the hue moves per color (a close to
// a wide spread) and the saturation. It is deterministic, so the same title
// always gives the same palette.
func coverPalette(title string) []string {
	hash := fnv.New32a()
	_, _ = hash.Write([]byte(title))
	sum := hash.Sum32()

	base := float64(sum % 360)
	step := 40 + float64((sum/360)%90)
	saturation := 0.55 + float64((sum/32400)%25)/100

	colors := make([]string, len(coverLightness))
	for i, lightness := range coverLightness {
		colors[i] = hslToHex(base+step*float64(i), saturation, lightness)
	}
	return colors
}

// hslToHex converts a color (hue in degrees, saturation and lightness in
// 0..1) to "#rrggbb".
func hslToHex(hue, saturation, lightness float64) string {
	hue = math.Mod(hue, 360)
	chroma := (1 - math.Abs(2*lightness-1)) * saturation
	x := chroma * (1 - math.Abs(math.Mod(hue/60, 2)-1))
	m := lightness - chroma/2

	var r, g, b float64
	switch int(hue / 60) {
	case 0:
		r, g, b = chroma, x, 0
	case 1:
		r, g, b = x, chroma, 0
	case 2:
		r, g, b = 0, chroma, x
	case 3:
		r, g, b = 0, x, chroma
	case 4:
		r, g, b = x, 0, chroma
	default:
		r, g, b = chroma, 0, x
	}
	channel := func(v float64) int { return int(math.Round((v + m) * 255)) }
	return fmt.Sprintf("#%02x%02x%02x", channel(r), channel(g), channel(b))
}

// coverSVG returns the generated cover for a pot title. It is deterministic,
// so the same title always gives the same bytes.
func coverSVG(title string) []byte {
	return []byte(avatars.Generate(avatars.Bauhaus, title, coverPalette(title), coverSize, true))
}

// newCoverFile wraps the generated cover of title as a file to store.
func newCoverFile(title string) (*filesystem.File, error) {
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
	file, err := newCoverFile(pot.GetString("title"))
	if err != nil {
		slog.Warn("make pot cover", "pot", pot.Id, "error", err)
		return
	}
	pot.Set("cover", file)
}
