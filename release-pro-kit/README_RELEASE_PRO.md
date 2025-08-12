# Release profesional: versionado + changelog + tag + Blue/Green

Este kit agrega:
- **Versionado semántico** (bump: major/minor/patch o x.y.z)
- **Changelog** desde commits (convencional: feat/fix/perf/...)
- **Tag git** anotado
- **Blue/Green** con Caddy y upstreams dinámicos (APP_UPSTREAM_WEB/API)

## Requisitos
- `git`, `jq`, `docker`, `docker compose`
- Tener desplegado `deploy-caddy/` (Caddy + TLS) y `deploy-monitoring/` (opcional)
- `deploy-caddy/.env` con variables de app (DB/Redis/S3/etc.) y `APP_DOMAIN`/`EMAIL_ADMIN`

## Flujo de release
```bash
# 1) Bump + changelog + tag
scripts/release/release_all.sh minor
# o:
scripts/release/bump_version.sh patch
scripts/release/changelog_generate.sh vX.Y.Z
scripts/release/create_tag.sh vX.Y.Z

# 2) Construir imágenes (ejemplo):
docker build -f deploy-caddy/Dockerfile.web  -t agro-web:vX.Y.Z .
docker build -f deploy-caddy/Dockerfile.api  -t agro-api:vX.Y.Z .

# 3) Habilitar Caddy con upstreams dinámicos
scripts/bluegreen/enable_proxy.sh

# 4) Switch Blue/Green sin downtime (a green, por ejemplo)
WEB_IMAGE=agro-web API_IMAGE=agro-api TAG=vX.Y.Z PROJECT_NAME=agro scripts/bluegreen/switch.sh green
# rollback:
WEB_IMAGE=agro-web API_IMAGE=agro-api TAG=vX.Y.Z PROJECT_NAME=agro scripts/bluegreen/switch.sh blue
```

> Los contenedores activos quedarán con nombres `${PROJECT_NAME}_web_<color>` y `${PROJECT_NAME}_api_<color>` en la red `agro_net`. Caddy rutea a los definidos en `deploy-caddy/.env` (`APP_UPSTREAM_WEB`, `APP_UPSTREAM_API`).

## Notas
- Los scripts no publican a un registry; si quieres usar un registro, haz `docker tag`/`docker push` y ajusta `WEB_IMAGE`/`API_IMAGE`.
- Changelog se genera de los commits desde el **último tag**, agrupados por tipo de commit.
- Si no existe `CHANGELOG.md`, se crea.
