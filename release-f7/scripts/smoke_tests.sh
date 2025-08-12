#!/usr/bin/env bash
set -euo pipefail

APP_DOMAIN="${APP_DOMAIN:-app.tu-dominio.com}"
BASE="https://${APP_DOMAIN}"
API="${BASE}/api"

echo "[smoke] Web health:"
curl -sk -I "${BASE}/healthz" | head -n1

echo "[smoke] API health:"
curl -sk "${API}/health" | sed -e 's/.*/[smoke] &/'

echo "[smoke] Reportes PDF endpoints (200 esperado):"
for path in "/reports/pl/pdf" "/reports/balance/pdf"; do
  code=$(curl -sk -o /dev/null -w "%{http_code}" "${API}${path}?companyId=dummy&from=2024-01-01&to=2024-12-31")
  echo "[smoke] ${path} -> ${code}"
done

echo "[smoke] MinIO console puerto 9001 accesible?"
nc -zv $(echo "${BASE}" | sed -E 's#https?://##') 9001 && echo "[smoke] OK 9001" || echo "[smoke] WARN 9001 no accesible (puede estar firewalleado)"

echo "[smoke] Blackbox/Prometheus sane (requiere monitoring stack):"
curl -sk "http://localhost:9090/-/healthy" | sed -e 's/.*/[smoke] Prometheus: &/'
curl -sk "http://localhost:9093/-/healthy" | sed -e 's/.*/[smoke] Alertmanager: &/'
