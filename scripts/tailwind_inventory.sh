#!/usr/bin/env bash
# Counts Tailwind utility classes per .tsx file, most first. It looks at every
# string literal (not only class="..."), so classList keys and template
# strings are counted too. The result is approximate: a quoted word in a
# comment can add noise, and a utility built at runtime is missed.
#
#   scripts/tailwind_inventory.sh
set -euo pipefail

cd "$(dirname "$0")/../frontend"

VARIANT='(sm|md|lg|xl|hover|focus|focus-within|disabled|enabled|dark|data-\[[a-z-]+\]):'
BARE='flex|inline-flex|grid|block|inline-block|hidden|contents|absolute|fixed|relative|sticky|invisible|truncate|sr-only|border|rounded|shadow|transition|underline|grow|shrink'
DASHED='flex|inset|top|right|bottom|left|z|m[trblxy]?|p[trblxy]?|w|h|min-w|min-h|max-w|max-h|gap|space-[xy]|items|justify|self|col|row|text|font|leading|bg|border|rounded|shadow|opacity|overflow|cursor|transition|duration|ease|animate|backdrop|outline|appearance|object|pointer-events|translate|whitespace|resize|shrink|grow'
UTILITY="^(${VARIANT})*-?(${BARE}|(${DASHED})-[^ ]+)\$"

# Public classes (see styles/components/*.css) that look like utilities.
PUBLIC='^(col-search|col-page|flex-box)$'

for file in $(find src -name '*.tsx' | sort); do
  count=$(
    { grep -oE '"[^"]*"|`[^`]*`' "$file" || true; } |
      tr -s ' "`' '\n' |
      { grep -E "$UTILITY" || true; } |
      { grep -vE "$PUBLIC" || true; } |
      wc -l
  )
  if [ "$count" -gt 0 ]; then
    printf '%5d %s\n' "$count" "$file"
  fi
done | sort -rn
