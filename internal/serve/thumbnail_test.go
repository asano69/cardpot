package serve

import (
	"strings"
	"testing"

	"github.com/pocketbase/pocketbase/core"

	"github.com/asano69/cardpot/internal/parser"
)

const (
	testDiagram = "code:mermaid\n\tgraph TD\n\t\tA-->B"
	testPNG     = "[https://example.com/a.png]"
)

// newThumbnailTestApp extends newSlugTestApp with the "renders" collection.
func newThumbnailTestApp(t *testing.T) core.App {
	t.Helper()
	app := newSlugTestApp(t)

	renders := core.NewBaseCollection("renders")
	renders.Fields.Add(
		&core.TextField{Name: "kind"},
		&core.TextField{Name: "content_hash"},
		&core.FileField{Name: "output_file", MaxSelect: 1},
	)
	if err := app.Save(renders); err != nil {
		t.Fatalf("create renders collection: %v", err)
	}
	return app
}

func countRenders(t *testing.T, app core.App) int64 {
	t.Helper()
	n, err := app.CountRecords("renders")
	if err != nil {
		t.Fatalf("count renders: %v", err)
	}
	return n
}

func TestThumbnailSrc_RendersMermaidOnceAndReusesIt(t *testing.T) {
	app := newThumbnailTestApp(t)
	note := parser.Parse("T\n" + testDiagram)

	first := thumbnailSrc(app, note)
	if !strings.HasPrefix(first, "/api/files/") || !strings.HasSuffix(first, ".svg") {
		t.Fatalf("thumbnail = %q, want an /api/files/ URL of an .svg", first)
	}
	if second := thumbnailSrc(app, note); second != first {
		t.Errorf("second thumbnail = %q, want the same %q", second, first)
	}
	if n := countRenders(t, app); n != 1 {
		t.Errorf("got %d renders, want 1", n)
	}
}

func TestThumbnailSrc_FirstInDocumentOrderWins(t *testing.T) {
	app := newThumbnailTestApp(t)

	if got := thumbnailSrc(app, parser.Parse("T\n"+testPNG+"\n"+testDiagram)); got != "https://example.com/a.png" {
		t.Errorf("image first: thumbnail = %q, want the image", got)
	}
	if n := countRenders(t, app); n != 0 {
		t.Errorf("got %d renders, want 0: a diagram after the image must not be rendered", n)
	}

	if got := thumbnailSrc(app, parser.Parse("T\n"+testDiagram+"\n"+testPNG)); !strings.HasPrefix(got, "/api/files/") {
		t.Errorf("diagram first: thumbnail = %q, want the diagram", got)
	}
}

func TestThumbnailSrc_UnrenderableDiagramFallsBackToLaterImage(t *testing.T) {
	app := newThumbnailTestApp(t)
	note := parser.Parse("T\ncode:mermaid\n\tthis is not a diagram\n" + testPNG)

	if got := thumbnailSrc(app, note); got != "https://example.com/a.png" {
		t.Errorf("thumbnail = %q, want the image", got)
	}
	if n := countRenders(t, app); n != 0 {
		t.Errorf("got %d renders, want 0", n)
	}
}

func TestThumbnailSrc_NoImageNoDiagram(t *testing.T) {
	app := newThumbnailTestApp(t)
	if got := thumbnailSrc(app, parser.Parse("T\nplain\ncode:ts\n\tx")); got != "" {
		t.Errorf("thumbnail = %q, want empty", got)
	}
}
