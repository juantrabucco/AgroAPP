#!/usr/bin/env bash
set -euo pipefail

PART="${1:-patch}"

# 1) Bump
NEW=$(scripts/release/bump_version.sh "$PART")
TAG="v$NEW"

# 2) Changelog
scripts/release/changelog_generate.sh "$TAG"

# 3) Tag + push
scripts/release/create_tag.sh "$TAG"

echo "[release] listo: $TAG"
