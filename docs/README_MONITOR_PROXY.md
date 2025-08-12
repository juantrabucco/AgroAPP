
# Proxy de monitoreo detrás de Caddy (TLS + Basic Auth)

Este archivo amplía el Caddyfile para servir Prometheus, Grafana y Alertmanager en el subdominio `${MONITOR_DOMAIN}` con **Basic Auth**.

## Pasos
1) Edita `deploy-caddy/.env` y completa:
   - `MONITOR_DOMAIN=monitor.tu-dominio.com`
   - `BASIC_AUTH_USER=admin`
   - `BASIC_AUTH_HASH=<bcrypt>` — genera con:
     ```bash
     docker run --rm caddy:2.8-alpine caddy hash-password --plaintext 'tu-pass'
     ```
2) Asegúrate que el stack de **monitoring** está corriendo en la **misma red** `agro_net` (ya configurado como `external: true`).
3) Reaplica Caddy:
   ```bash
   docker compose -f deploy-caddy/docker-compose.yml --env-file deploy-caddy/.env up -d --build
   ```

## Rutas
- Grafana: `https://${MONITOR_DOMAIN}/grafana`
- Prometheus: `https://${MONITOR_DOMAIN}/prometheus`
- Alertmanager: `https://${MONITOR_DOMAIN}/alertmanager`
