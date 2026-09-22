// validate.go rejects saving a "cards" record whose title is a
// reserved word (see internal/slug.IsReserved) -- e.g. any case
// variant of "new" -- since such a title would collide with the
// "/:slug/new" draft-creation route (see
// frontend/src/lib/router.tsx).
package serve

import (
	"fmt"

	"github.com/pocketbase/pocketbase"
	"github.com/pocketbase/pocketbase/core"

	"github.com/asano69/cardpot/internal/slug"
)

// registerValidationHooks wires up every OnRecordValidate hook this
// package needs. Called once from Run (see serve.go).
func registerValidationHooks(app *pocketbase.PocketBase) {
	app.OnRecordValidate("cards").BindFunc(func(e *core.RecordEvent) error {
		title := e.Record.GetString("title")
		if slug.IsReserved(title) {
			return fmt.Errorf("title %q is reserved", title)
		}
		return e.Next()
	})
}
