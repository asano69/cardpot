#!/usr/bin/env bash

set -euo pipefail

for i in $(seq 1 1000); do
  title="page${i}"

  fortune | jq -Rs --arg title "$title" '
        split("\n")
        | if .[-1] == "" then .[:-1] else . end
        | map(
            gsub("\t"; "")
            | gsub("\\["; "")
            | gsub("\\]"; "")
        )
        | {
            title: $title,
            lines: [$title] + .
        }
    '
done | jq -s '{
    pages: .
}'
