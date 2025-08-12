# Monitoring & Alerts (Prometheus + Grafana + Alertmanager + Exporters)

Este bundle agrega monitoreo y alertas listo para producción:

- **cAdvisor** y **node-exporter**: métricas de host/containers
- **postgres-exporter**: base de datos
- **blackbox-exporter**: probes HTTP a `/healthz` (web) y `/api/health` (api)
- **Prometheus**: recolección + **reglas de alertas**
- **Alertmanager**: envía alertas a **Slack** (webhook)
- **Grafana**: dashboards (datasource y un dashboard simple preprovisionado)
- **health_pinger**: verificador simple que envía mensajes al Slack webhook si falla

## Preparación
1. Copia `deploy-monitoring/` al **root** del repo.
2. Completa `deploy-monitoring/.env` con `SLACK_WEBHOOK`, `TARGET_WEB`, `TARGET_API` y credenciales admin.
3. Lanza:
```bash
docker compose -f deploy-monitoring/docker-compose.monitoring.yml --env-file deploy-monitoring/.env up -d --build
```
- Prometheus: `http://<host>:9090`
- Alertmanager: `http://<host>:9093`
- Grafana: `http://<host>:3002` (user/pass en `.env`)
- cAdvisor: `http://<host>:8080`

## Notas
- `node_exporter` corre en modo host para ver métricas del sistema.
- Ajusta `PROM_SCRAPE_INTERVAL` si necesitas más granularidad.
- Edita `prometheus/alerts.yml` para más reglas (memoria, latencia, etc.).
