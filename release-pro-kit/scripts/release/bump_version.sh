#!/usr/bin/env bash
set -euo pipefail

# Usage: scripts/release/bump_version.sh [major|minor|patch|x.y.z]
# Requires: jq

ROOT=$(git rev-parse --show-toplevel 2>/dev/null || echo ".")

cd "$ROOT"

if ! command -v jq >/dev/null 2>&1; then
  echo "jq no está instalado. Instálalo para proceder." >&2
  exit 1
fi

CURRENT=$(jq -r '.version // "0.1.0"' package.json 2>/dev/null || echo "0.1.0")

bump() {
  local v="$1"
  local part="$2"
  IFS='.' read -r MA MI PA <<<"$v"
  if [[ "$part" == "major" ]]; then
    echo "$((MA+1)).0.0"
  elif [[ "$part" == "minor" ]]; then
    echo "$MA.$((MI+1)).0"
  elif [[ "$part" == "patch" ]]; then
    echo "$MA.$MI.$((PA+1))"
  else
    echo "$part"
  fi
}

TARGET="${1:-patch}"
NEW="$(bump "$CURRENT" "$TARGET")"

echo "[bump] $CURRENT -> $NEW"

# Write VERSION file
echo "$NEW" > VERSION

update_pkg() {
  local file="$1"
  if [[ -f "$file" ]]; then
    tmp=$(mktemp)
    jq --arg v "$NEW" '.version=$v' "$file" > "$tmp" && mv "$tmp" "$file"
    echo "[bump] actualizado $file"
  fi
}
update_pkg package.json
update_pkg apps/web/package.json
update_pkg apps/api/package.json

git add VERSION package.json apps/web/package.json apps/api/package.json 2>/dev/null || true
git commit -m "chore(release): bump version to v$NEW" || echo "[bump] nada para commitear"
echo "$NEW"
