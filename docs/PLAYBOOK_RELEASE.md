# Playbook de Release — F7

## 1) DNS + TLS
- Apuntar `APP_DOMAIN` al servidor (A/AAAA).
- Completar `deploy-caddy/.env` con `APP_DOMAIN`, `EMAIL_ADMIN`, secretos.
- Levantar con Caddy:
  ```bash
  docker compose -f deploy-caddy/docker-compose.yml --env-file deploy-caddy/.env up -d --build
  ```

## 2) Backups + Restore (ensayo DR)
- Verifica que el servicio `backup` esté corriendo.
- Ensayo de restore (sin downtime): restaurar a DB nueva y recalibrar `DATABASE_URL` para pruebas:
  ```bash
  ./scripts/restore_postgres.sh /ruta/a/db-YYYYMMDD-HHMM.sql.gz agro_db_restore
  # Cambia DATABASE_URL a agro_db_restore y relanza API (solo entorno de prueba)
  ```
- Resultado esperado: login OK, datos demo visibles, generación de PDFs OK.

## 3) Monitoring + Alertas
- Levantar stack de monitoring:
  ```bash
  docker compose -f deploy-monitoring/docker-compose.monitoring.yml --env-file deploy-monitoring/.env up -d --build
  ```
- Configurar proxy TLS del monitor en `deploy-caddy/.env` (`MONITOR_DOMAIN`, `BASIC_AUTH_*`) y reaplicar Caddy.
- Acceder:
  - Grafana: `https://$MONITOR_DOMAIN/grafana`
  - Prometheus: `https://$MONITOR_DOMAIN/prometheus`
  - Alertmanager: `https://$MONITOR_DOMAIN/alertmanager`

## 4) Smoke tests
```bash
APP_DOMAIN=app.tu-dominio.com bash scripts/smoke_tests.sh
```

## 5) Pruebas de alertas
- **InstanceDown:** detener API 3 min:
  ```bash
  docker compose -f deploy-caddy/docker-compose.yml stop api && sleep 190 && docker compose -f deploy-caddy/docker-compose.yml start api
  ```
- **HttpLatencyHigh:** simular latencia con bloqueo de red o limitando ancho de banda temporalmente (opcional).

## 6) Checklist final
- ✅ HTTPS emitido y renovando (Caddy logs sin errores).
- ✅ Backups generándose y **restore** ensayado (con DB separada).
- ✅ Monitoreo operativo, paneles visibles y alertas llegando al Slack.
- ✅ Variables `.env` saneadas (sin defaults en producción).
- ✅ Primer usuario OWNER creado y roles probados.
- ✅ Documentación entregada (este playbook + DRILL).

---
**Go Live**: cortar versión, ejecutar migraciones en prod, seed opcional, anunciar.
