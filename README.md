# Agro Suite — Monorepo + Deploy (Prod) + Ops

Este paquete incluye:
- `app/` — monorepo con **API (NestJS)** y **Web (Next.js)** + infra de desarrollo.
- `deploy-caddy/` — despliegue producción con **Caddy (HTTPS)**, Postgres, Redis, MinIO y backups.
- `deploy-monitoring/` — Prometheus, Grafana, Alertmanager, exporters y pinger.
- `release-pro-kit/` — scripts de **versión, changelog, tag** y **blue/green**.
- `release-ci-kit/` — **GitHub Actions** para build/push/deploy.
- `release-f7/` — playbook de release, restore y smoke tests.
- `docs/` — diagramas y guías.

## Dev (local)
```bash
# Dependencias: Node 20+, pnpm, Docker
docker compose -f app/infra/docker-compose.yml up -d postgres redis minio
pnpm -C app/apps/api i && pnpm -C app/apps/web i
pnpm -C app/apps/api prisma:migrate
pnpm -C app/apps/api start:dev
pnpm -C app/apps/web dev
# Web: http://localhost:3000  | API: http://localhost:3001/api
```

## Producción (HTTPS + Backups)
```bash
# 1) Configurar dominios y secretos
cp deploy-caddy/.env.example deploy-caddy/.env
# editar APP_DOMAIN, EMAIL_ADMIN, POSTGRES_*, JWT_SECRET, etc.

# 2) Arrancar
docker compose -f deploy-caddy/docker-compose.yml --env-file deploy-caddy/.env up -d --build
# App: https://$APP_DOMAIN/ | API: https://$APP_DOMAIN/api
```

## Monitoring (opcional y recomendado)
```bash
cp deploy-monitoring/.env.example deploy-monitoring/.env
# configurar SLACK_WEBHOOK, TARGET_WEB=https://$APP_DOMAIN/healthz, TARGET_API=https://$APP_DOMAIN/api/health
docker compose -f deploy-monitoring/docker-compose.monitoring.yml --env-file deploy-monitoring/.env up -d --build
# Si deseas TLS y auth para monitor:
# Completar MONITOR_DOMAIN, BASIC_AUTH_* en deploy-caddy/.env y reaplicar Caddy.
```

## Release profesional (tag + changelog + blue/green)
Ver `release-pro-kit/README_RELEASE_PRO.md` y `release-ci-kit/docs/CI_SETUP.md`.

## Restauración y smoke tests
Ver `release-f7/` y `docs/`.