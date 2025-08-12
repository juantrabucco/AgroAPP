# CI/CD — Release, Build & Deploy (Blue/Green)

Este workflow hace:
1. **Detecta versión** por tag `vX.Y.Z` (o input manual).
2. **Build & push** de imágenes a **GHCR** (`ghcr.io/<owner>/agro-web|agro-api`).
3. **Deploy blue/green** por **SSH** en el servidor, usando los scripts del repo.

## Requisitos
- En el servidor: repo desplegado con nuestras carpetas `deploy-caddy/` y `scripts/bluegreen/` (del kit previo).
- Red Docker `agro_net` compartida y **Caddy** activo (TLS).
- Secrets en el repo:
  - `SSH_HOST`, `SSH_USER`, `SSH_KEY` (clave privada), `SSH_PORT` (ej. `22`)
  - `DEPLOY_PATH` (ruta al proyecto en el server, ej. `/srv/agro-app`)
  - *(Opcional)* `GHCR_TOKEN` no es necesario: se usa `GITHUB_TOKEN` por defecto para publicar paquetes en GHCR.

## Disparadores
- **push tag** `v*`: build + push + deploy automático.
- **workflow_dispatch**: manual, con inputs `tag` y `color`.

## Notas
- Las imágenes se taggean con la versión y `latest`.
- El switch **green/blue** valída health de los containers antes de mover tráfico.
- Para rollback, reejecuta el job con `color` opuesto o corre `switch.sh` a mano en el server.
