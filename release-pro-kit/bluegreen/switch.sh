#!/usr/bin/env bash
set -euo pipefail

# Zero-downtime Blue/Green switch
# Pre-reqs:
#   - images built and available (WEB_IMAGE, API_IMAGE + TAG)
#   - deploy-caddy/.env contiene credenciales y variables app
#   - Caddyfile azul/verde activo (scripts/bluegreen/enable_proxy.sh)

COLOR="${1:-green}" # or blue
PROJECT_NAME="${PROJECT_NAME:-agro}"
STACK_FILE="bluegreen/docker-compose.bluegreen.yml"

set -a
source deploy-caddy/.env
set +a

UP_WEB="${PROJECT_NAME}_web_${COLOR}"
UP_API="${PROJECT_NAME}_api_${COLOR}"

# Levantar color elegido
docker compose -f "$STACK_FILE" --env-file deploy-caddy/.env up -d "web_${COLOR}" "api_${COLOR}"

# Health checks
sleep 3
WEB_CODE=$(docker run --rm --network agro_net curlimages/curl -sk -o /dev/null -w "%{http_code}" "http://${UP_WEB}:3000/healthz" || echo 000)
API_CODE=$(docker run --rm --network agro_net curlimages/curl -sk -o /dev/null -w "%{http_code}" "http://${UP_API}:3001/health" || echo 000)

echo "[switch] health web=${WEB_CODE} api=${API_CODE}"
if [[ "$WEB_CODE" != "200" || "$API_CODE" != "200" ]]; then
  echo "[switch] nuevo color no saludable. Abortando." >&2
  exit 1
fi

# Cambiar upstreams en .env y recargar Caddy
sed -i.bak "s#^APP_UPSTREAM_WEB=.*#APP_UPSTREAM_WEB=${UP_WEB}:3000#g" deploy-caddy/.env || echo "APP_UPSTREAM_WEB=${UP_WEB}:3000" >> deploy-caddy/.env
sed -i.bak "s#^APP_UPSTREAM_API=.*#APP_UPSTREAM_API=${UP_API}:3001#g" deploy-caddy/.env || echo "APP_UPSTREAM_API=${UP_API}:3001" >> deploy-caddy/.env
docker compose -f deploy-caddy/docker-compose.yml --env-file deploy-caddy/.env up -d caddy
docker compose -f deploy-caddy/docker-compose.yml exec caddy caddy reload --config /etc/caddy/Caddyfile

echo "[switch] Trafico movido a ${COLOR} (${UP_WEB}, ${UP_API})"

# Opcional: apagar color opuesto
OPP="green"; [[ "$COLOR" == "green" ]] && OPP="blue"
docker compose -f "$STACK_FILE" --env-file deploy-caddy/.env stop "web_${OPP}" "api_${OPP}" || true
