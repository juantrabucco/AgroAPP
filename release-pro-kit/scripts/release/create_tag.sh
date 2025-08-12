#!/usr/bin/env bash
set -euo pipefail

# Usage: scripts/release/create_tag.sh [vX.Y.Z]
# If not provided, reads from VERSION

ROOT=$(git rev-parse --show-toplevel 2>/dev/null || echo ".")
cd "$ROOT"

TAG="${1:-}"
if [[ -z "$TAG" ]]; then
  TAG="v$(cat VERSION)"
fi

git tag -a "$TAG" -m "Release $TAG"
git push origin "$TAG"
echo "[tag] creado y enviado $TAG"
