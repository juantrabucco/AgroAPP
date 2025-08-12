# Starter Agro App — Next.js + NestJS + Prisma (Postgres) + RBAC + PWA + BullMQ + S3 + Double-entry

Monorepo base para una app agro/ganadera con:
- **Next.js (app router)** con **FullCalendar**, **Recharts**, **PWA (Dexie/IndexedDB)** y exportes **Excel/PDF**.
- **NestJS** (REST) con **Prisma + Postgres**, **Auth JWT**, **RBAC** por rol/empresa/campo, **BullMQ/Redis** (recordatorios), **S3 (MinIO)** para adjuntos.
- **Contabilidad** con partida doble (plan de cuentas, asientos y líneas), **Cuentas corrientes** por contraparte.
- **Multi-tenant** (empresa) y **multi-campo** (scoping y permisos).
- **Docker Compose** para Postgres, Redis y MinIO. (Metabase opcional).

> ⚠️ Esto es un **starter**. Incluye endpoints y pantallas mínimas de ejemplo. Expande modelos/validaciones a tu necesidad.

## Requisitos
- Node 18+ / 20+
- Docker + Docker Compose

## Inicio rápido
```bash
cp .env.example .env
docker compose up -d postgres redis minio
# Instalar deps
pnpm i --filter ./apps/api --filter ./apps/web
# Migrar DB y seed
pnpm -C apps/api prisma:migrate
pnpm -C apps/api prisma:seed
# Levantar API y Web (en terminals separadas)
pnpm -C apps/api start:dev
pnpm -C apps/web dev
```
API: http://localhost:3001  —  Web: http://localhost:3000

## Estructura
```
/apps
  /api    NestJS + Prisma
  /web    Next.js (app router)
/infra   Docker Compose, scripts
/prisma  (schema y seeds se mantienen dentro de /apps/api)
```

## Credenciales de prueba
- Usuario seed: **admin@example.com** / **changeme** (no usar en producción)
- Compañía semilla: **Demo SA**
- Campo semilla: **Campo Norte**

## Exportes
- **Excel**: SheetJS en front (por filtros de tabla).
- **PDF**: endpoint en API que renderiza HTML a PDF (Puppeteer).

## Licencia
MIT (este starter). Revisa licencias de librerías externas.

## Permisos (CASL)
- Guard `PoliciesGuard` + decorador `@CheckAbility(action, subject)`.
- Ejemplo: el rol **WORKER (peón)** puede `create` **HealthApplication** solo en sus `fieldId` asignados.

## Autenticación en el Front
- Página **/login** (email + password) → guarda **JWT** y datos del usuario.
- **AuthProvider** (contexto) expone `token`, `user`, `companyId`, `login`, `logout`.
- **Shell** aplica un guard simple: si no hay token, redirige a `/login`.
- Navegación y botones se **ocultan** según rol (ej.: Contabilidad solo para OWNER/ADMIN/ACCOUNTANT).

## Multi-tenant automático
- **AsyncLocalStorage** captura usuario/empresa/campos por request.
- **Prisma middleware** inyecta `companyId` en queries y crea registros con el `companyId` del contexto.

## Sanidad → Asiento contable
- Al registrar **aplicación sanitaria** con `cost`, se postea: Debe **Gastos Sanitarios (5101)** / Haber **Caja (1101)**.

## Reportes PDF
- Endpoint `POST /reports/pdf` que acepta `html` o `{ title, rows }` y devuelve un PDF (Puppeteer).
- Front de prueba en `/reportes/demo`.

## Gestión de permisos por campo
- Endpoints `GET /rbac/users` y `POST /rbac/assign`.
- UI básica en `/admin/permisos` (solo OWNER/ADMIN).
