#!/usr/bin/env bash
set -euo pipefail

function ping() {
  local url="$1"
  local name="$2"
  local status
  status=$(curl -sk -o /dev/null -w "%{http_code}" "$url" || echo "000")
  if [[ "$status" != "200" && "$status" != "204" && "$status" != "302" ]]; then
    echo "[pinger] $name DOWN ($status)"
    if [[ -n "${SLACK_WEBHOOK:-}" ]]; then
      curl -s -X POST -H 'Content-type: application/json' --data "{"text":"❌ ${name} (${url}) está caído: HTTP ${status}"}" "$SLACK_WEBHOOK" >/dev/null || true
    fi
  else
    echo "[pinger] $name OK ($status)"
  fi
}

[[ -n "${TARGET_WEB:-}" ]] && ping "$TARGET_WEB" "WEB"
[[ -n "${TARGET_API:-}" ]] && ping "$TARGET_API" "API"
