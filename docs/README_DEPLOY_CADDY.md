# Despliegue con HTTPS automático (Caddy) + Backups de PostgreSQL

Este bundle agrega **Caddy** con certificados TLS de Let's Encrypt y un **job de backups** para PostgreSQL.

## Archivos
- `docker-compose.yml` — orquesta **caddy**, **web**, **api**, **postgres**, **redis**, **minio**, **backup**.
- `caddy/Caddyfile` — reverse proxy + TLS automático para `${APP_DOMAIN}`.
- `Dockerfile.api`, `Dockerfile.web` — builds de API y Web para producción.
- `backup/Dockerfile`, `backup/run.sh`, `backup/crontab` — job diario de backups con retención y opcional **upload a MinIO (S3)**.
- `.env.example` — variables necesarias.

## Preparación
1. Copia `deploy-caddy/` al **root** del repo (mismo nivel que `apps/`).
2. Duplica `.env.example` → `.env` y completa:
   - `APP_DOMAIN` (DNS apuntando al servidor)
   - `EMAIL_ADMIN` (para Let's Encrypt)
   - Secretos: `JWT_SECRET`, `POSTGRES_*`, `S3_*` si usas MinIO
3. Verifica que el frontend use `/api` (`NEXT_PUBLIC_API_URL=/api`).

## Levantar
```bash
docker compose -f deploy-caddy/docker-compose.yml --env-file deploy-caddy/.env up -d --build
```
- App con HTTPS: `https://$APP_DOMAIN/`
- API: `https://$APP_DOMAIN/api`
- MinIO Console: `http://<host>:9001`

## Backups
- Se generan en el volumen `db_backups` (host persistente).
- Cron configurable con `BACKUP_CRON` (default: `30 2 * * *` → 02:30).
- Retención con `BACKUP_RETENTION_DAYS` (default: 14 días).
- Para subir a S3 (MinIO), setear:
  - `S3_BACKUP_ENABLE=true`
  - `S3_ENDPOINT=http://minio:9000` (o el de tu S3)
  - `S3_ACCESS_KEY`, `S3_SECRET_KEY`, `S3_BACKUP_BUCKET`, `S3_BACKUP_PREFIX`

## Tips
- Caddy renueva certificados automáticamente.
- Asegúrate de abrir puertos 80 y 443 en el firewall.
- Healthchecks: web y api con `wget` para reinicios más predecibles.
- La API corre `prisma migrate deploy` al inicio; ejecuta `seed` si tu proyecto lo requiere.
