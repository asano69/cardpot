#!/usr/bin/env bash
# Lists public tokens that no stylesheet or editor module reads yet.
set -euo pipefail

cd "$(dirname "$0")/../frontend"
while read -r token; do
  [ -z "$token" ] && continue
  if ! grep -rqF "var($token" src --include='*.css' --include='*.ts' --include='*.tsx' \
      --exclude=tokens.test.ts; then
    echo "$token"
  fi
done < src/styles/tokens.txt
