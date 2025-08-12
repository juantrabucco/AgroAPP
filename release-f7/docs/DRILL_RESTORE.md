# DRILL — Restore de Base de Datos

Objetivo: validar que un `db-*.sql.gz` permite recuperar el sistema.

## Pasos
1) Elige un backup (o usa el último del volumen `db_backups` sin pasar ruta).
2) Restaura a una **DB nueva**:
   ```bash
   ./scripts/restore_postgres.sh /path/a/db-20250115-0230.sql.gz agro_db_restore
   ```
3) Cambia temporalmente la `DATABASE_URL` en `deploy-caddy/.env` para apuntar a `agro_db_restore` y relanza **solo** la API en un entorno de prueba:
   ```bash
   docker compose -f deploy-caddy/docker-compose.yml --env-file deploy-caddy/.env up -d --build api
   ```
4) Verifica:
   - Iniciar sesión.
   - Ver datos de demo / empresa.
   - Generar **PDFs** (P&L y Balance).
   - Abrir dashboard.
5) Revertir `DATABASE_URL` al valor original.

**Notas**: No restaures sobre la DB en uso en horario hábil. Usa una DB nueva y haz switching en una ventana de mantenimiento si fuese necesario.
