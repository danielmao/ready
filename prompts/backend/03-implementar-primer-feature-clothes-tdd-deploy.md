---
category: backend
source_raw: _inbox/20260630-115800-implementa-el-primer-feature-clothes-tdd-deploy.md
captured_at: 2026-06-30T11:58:00+00:00
status: curated
---

# Implementar el primer feature (armario / Clothes) end-to-end con TDD y deploy

**Intención.** Usar las skills del proyecto para llevar el **primer feature de producto** —el
armario digital (dominio `clothes`)— de principio a fin: plan → backend con TDD y e2e → base
de datos en Docker → frontend → verificación → deploy AWS, dejando la base para los features
siguientes (`outfits`, `planning`).

**Contexto / decisiones.**
- **Ramas:** `mvp` (desde la base con el deploy/health) y de ahí `feat/clothes-domain`.
- **Workflow con skills:** `write-spec` (spec en `docs/specs/active/clothes-domain.md`),
  `new-domain` (scaffold DDD por capas), `implement`, `e2e-local`, `new-screen`, `review-spec`.
- **TDD + e2e levantando servicios:** specs de use-cases (create/list/archive) + recorrido HTTP
  real (catálogos → crear → listar → ver → editar → archivar → 404 tras archivar).
- **Persistencia:** Prisma + Postgres en Docker (`compose.dev.yaml`, puerto 5433), esquema MVP
  completo migrado + seed idempotente; guard `@CurrentUser` (single-user MVP).
- **Separar responsabilidades:** entidades planas → contratos con token → use-cases (un
  `execute()`) → `ClothesFacade` (única superficie pública) → controller delgado → repos Prisma.
  Cruce entre dominios **solo vía facade** (enforced por `dependency-cruiser`).
- **Frontend:** base Expo + feature `clothes` (lista + alta) consumiendo la API; verificar que
  el front **corresponde** al back (cada llamada del `clothesApi` mapea a una ruta real).
- **`/loop`:** resolver los inconvenientes que aparezcan según las buenas prácticas del repo
  (se arreglaron, entre otros, falsos positivos del linter de boundaries, Prisma en Alpine,
  layout del build).
- **Cierre:** análisis de regresión + refactor si hace falta, **deploy a AWS del backend** y
  **documentar los servicios** desplegados.

**Resultado.** Dominio `clothes` shippeado (backend + mobile), verificado por e2e HTTP (12
pasos PASS) y `lint:arch`/jest en verde; backend desplegado en AWS (EC2 + Docker: api +
postgres + Caddy, migra/siembra al arrancar) y servicios documentados; PR `feat/clothes-domain`
→ `mvp`.
