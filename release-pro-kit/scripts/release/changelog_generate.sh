#!/usr/bin/env bash
set -euo pipefail

# Requires: git
# Usage: scripts/release/changelog_generate.sh vX.Y.Z

TAG="${1:-}"
if [[ -z "$TAG" ]]; then
  echo "Uso: $0 vX.Y.Z" >&2
  exit 1
fi

LAST_TAG=$(git describe --tags --abbrev=0 2>/dev/null || echo "")
RANGE=""
if [[ -n "$LAST_TAG" ]]; then
  RANGE="$LAST_TAG..HEAD"
else
  RANGE="HEAD"
fi

DATE=$(date +"%Y-%m-%d")
HEADER="## $TAG — $DATE"

mapfile -t COMMITS < <(git log --pretty=format:'%s|%h' $RANGE)

FEATURES=()
FIXES=()
PERF=()
CHORE=()

for c in "${COMMITS[@]}"; do
  IFS='|' read -r subject hash <<< "$c"
  line="- ${subject} (${hash})"
  if [[ "$subject" =~ ^feat ]]; then
    FEATURES+=("$line")
  elif [[ "$subject" =~ ^fix ]]; then
    FIXES+=("$line")
  elif [[ "$subject" =~ ^perf ]]; then
    PERF+=("$line")
  else
    CHORE+=("$line")
  fi
done

SECTION() {
  local title="$1"; shift
  local arr=("$@")
  if [[ ${#arr[@]} -gt 0 ]]; then
    echo -e "\n### $title"
    printf '%s\n' "${arr[@]}"
  fi
}

OUT="$HEADER"
OUT+=$(SECTION "Features" "${FEATURES[@]}")
OUT+=$(SECTION "Fixes" "${FIXES[@]}")
OUT+=$(SECTION "Performance" "${PERF[@]}")
OUT+=$(SECTION "Other" "${CHORE[@]}")

if [[ ! -f CHANGELOG.md ]]; then
  echo "# Changelog" > CHANGELOG.md
fi

echo -e "\n$OUT\n" | cat - CHANGELOG.md > CHANGELOG.new && mv CHANGELOG.new CHANGELOG.md

git add CHANGELOG.md
git commit -m "docs(changelog): update for $TAG" || true
