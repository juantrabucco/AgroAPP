#!/usr/bin/env bash
set -euo pipefail

# Usage:
#   ./scripts/restore_postgres.sh /path/a/backup.sql.gz TARGET_DB_NAME
#   ./scripts/restore_postgres.sh (auto: toma el último backup de volumen db_backups) TARGET_DB_NAME
#
# Reqs: docker, acceso al stack de compose, variables de entorno correctas.
# Nota: restaura a una **DB nueva** (recomendada). Para "swap", actualiza DATABASE_URL y recarga la API.

BACKUP_FILE="${1:-}"
TARGET_DB="${2:-agro_db_restore}"
COMPOSE_CADDY="deploy-caddy/docker-compose.yml"

if [[ -z "${BACKUP_FILE}" ]]; then
  echo "[restore] No se pasó el backup. Busco el último en el volumen docker 'db_backups'..."
  # Volcar el contenido del volumen a /tmp para listar (requiere contenedor temporal)
  docker run --rm -v db_backups:/b alpine:3.19 sh -lc "ls -1 /b/db-*.sql.gz 2>/dev/null | sort | tail -n1" > /tmp/last_backup.txt || true
  BACKUP_IN_VOL="$(cat /tmp/last_backup.txt || true)"
  if [[ -z "${BACKUP_IN_VOL}" ]]; then
    echo "[restore] No encontré backups en el volumen. Pasa la ruta del .sql.gz explícitamente."
    exit 1
  fi
  echo "[restore] Usando último backup del volumen: ${BACKUP_IN_VOL}"
  BACKUP_FILE="${BACKUP_IN_VOL}"
  # Copiar a /tmp para facilitar piping (usando contenedor temporal)
  docker run --rm -v db_backups:/b -v /tmp:/t alpine:3.19 sh -lc "cp ${BACKUP_FILE} /t/restore.sql.gz"
  BACKUP_FILE="/tmp/restore.sql.gz"
fi

# Cargar variables de deploy-caddy/.env
set -a
if [[ -f "deploy-caddy/.env" ]]; then
  source deploy-caddy/.env
else
  echo "[restore] WARNING: no encontré deploy-caddy/.env; usando defaults"
fi
set +a

PGHOST="postgres"
PGUSER="${POSTGRES_USER:-agro}"
PGPASS="${POSTGRES_PASSWORD:-agro_pass}"
PGDB_DEFAULT="${POSTGRES_DB:-agro_db}"

echo "[restore] Target DB: ${TARGET_DB} (host=${PGHOST} user=${PGUSER})"

# Crear DB destino si no existe
docker compose -f "${COMPOSE_CADDY}" exec -T postgres sh -lc "export PGPASSWORD='${PGPASS}'; psql -U '${PGUSER}' -h localhost -tc \"SELECT 1 FROM pg_database WHERE datname='${TARGET_DB}'\" | grep -q 1 || psql -U '${PGUSER}' -h localhost -c \"CREATE DATABASE \\\"${TARGET_DB}\\\";\""

# Restaurar
if [[ "${BACKUP_FILE}" == /tmp/* ]]; then
  echo "[restore] Restaurando desde copia temporal ${BACKUP_FILE}"
  gunzip -c "${BACKUP_FILE}" | docker compose -f "${COMPOSE_CADDY}" exec -T postgres sh -lc "export PGPASSWORD='${PGPASS}'; psql -U '${PGUSER}' -h localhost ${TARGET_DB}"
else
  echo "[restore] Montando backup desde host: ${BACKUP_FILE}"
  docker run --rm --network host -v "${BACKUP_FILE}":/b.sql.gz alpine:3.19 sh -lc "apk add --no-cache gzip >/dev/null; gunzip -c /b.sql.gz" | docker compose -f "${COMPOSE_CADDY}" exec -T postgres sh -lc "export PGPASSWORD='${PGPASS}'; psql -U '${PGUSER}' -h localhost ${TARGET_DB}"
fi

echo "[restore] OK. Para usar esta DB, actualiza DATABASE_URL en deploy-caddy/.env, por ejemplo:"
echo "  DATABASE_URL=postgresql://${PGUSER}:${PGPASS}@postgres:5432/${TARGET_DB}?schema=public"
echo "y luego reconstruye/recarga la API:"
echo "  docker compose -f ${COMPOSE_CADDY} --env-file deploy-caddy/.env up -d --build api"
