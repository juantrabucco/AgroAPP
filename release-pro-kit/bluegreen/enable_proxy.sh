#!/usr/bin/env bash
set -euo pipefail
# Copy Caddyfile.bluegreen into deploy-caddy and reload
cp -f bluegreen/Caddyfile.bluegreen deploy-caddy/caddy/Caddyfile
docker compose -f deploy-caddy/docker-compose.yml --env-file deploy-caddy/.env up -d caddy
docker compose -f deploy-caddy/docker-compose.yml exec caddy caddy reload --config /etc/caddy/Caddyfile
echo "[bluegreen] Caddyfile activado para upstreams dinámicos (APP_UPSTREAM_*)"
