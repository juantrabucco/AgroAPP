#!/usr/bin/env bash
set -euo pipefail

export PGPASSWORD="${POSTGRES_PASSWORD:-}"
TS=$(date +"%Y%m%d-%H%M")
FILE="/backups/db-${TS}.sql.gz"

echo "[backup] Starting dump to $FILE"
pg_dump -h "${POSTGRES_HOST:-postgres}" -U "${POSTGRES_USER:-postgres}" -d "${POSTGRES_DB:-postgres}" -F p | gzip -c > "$FILE"
echo "[backup] Dump completed"

# Retention
if [[ -n "${RETENTION_DAYS:-}" ]]; then
  find /backups -type f -name "db-*.sql.gz" -mtime +${RETENTION_DAYS} -print -delete || true
fi

# Optional upload to S3 (MinIO)
if [[ "${S3_BACKUP_ENABLE:-false}" == "true" ]]; then
  echo "[backup] Upload to S3 enabled"
  ./mc alias set s3 "${S3_ENDPOINT}" "${S3_ACCESS_KEY}" "${S3_SECRET_KEY}" --api S3v4
  ./mc mb -p s3/"${S3_BUCKET}" || true
  ./mc cp "$FILE" s3/"${S3_BUCKET}"/"${S3_PREFIX:-db/}"
  echo "[backup] Uploaded to s3/${S3_BUCKET}/${S3_PREFIX}"
fi
