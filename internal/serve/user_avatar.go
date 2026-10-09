// user_avatar.go gives every user a generated avatar, so the user menu does
// not have to fall back to an initial (see generated_image.go). Superusers
// are not in the "users" collection and have no avatar.
package serve

import (
	"github.com/pocketbase/pocketbase/core"
	"github.com/sig-0/boring-avatars-go/avatars"
)

// avatarSize is the width and height of the generated SVG, in pixels.
const avatarSize = 128

// avatarPalette is the palette used for generated avatars.
var avatarPalette = []string{"#00686c", "#32c2b9", "#edecb3", "#fad928", "#ff9915"}

var userAvatar = generatedImage{
	collection: "users",
	field:      "avatar",
	fileName:   "avatar.svg",
	seed: func(user *core.Record) string {
		// A user without a name is identified by the email address.
		if name := user.GetString("name"); name != "" {
			return name
		}
		return user.GetString("email")
	},
	svg: func(seed string) []byte {
		return []byte(avatars.Generate(avatars.Beam, seed, avatarPalette, avatarSize, true))
	},
}
