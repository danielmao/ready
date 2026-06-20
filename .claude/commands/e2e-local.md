---
description: Pruebas e2e locales por HTTP contra la API NestJS (Postgres docker + API) golpeando clothes/outfits/planning, con reporte.
---

# /e2e-local

Verifica el **core flow de punta a punta** contra la API local real (HTTP), no la suite Jest.
Fase **Review** del workflow; su reporte alimenta a `/review-spec`.

> **Prerrequisito.** `apps/backend` debe existir y exponer los endpoints de
> `docs/04-API-SPECIFICATION.md`. Si aún no existe (estado actual del repo), decílo y no
> simules resultados.

## Entrada
- `$ARGUMENTS` = escenario opcional (default: **happy path completo**) + `API_URL`
  (default `http://localhost:3000/api`).

## Pasos (ver `docs/08-INSTALLATION-GUIDE.md`)
1. Levantar stack local: `docker compose up -d postgres` → `npx prisma migrate dev` →
   `npm run seed` → `npm run start:dev` (en background).
2. Healthcheck: `curl $API_URL/clothes/categories` debe devolver el catálogo sembrado.
3. Recorrer el flujo y capturar **status + IDs** por paso:
   - `GET` catálogos (categories/colors/occasions).
   - `POST /clothes` (crear ≥2 prendas).
   - `POST /outfits` con ≥2 items → **verificar 400 al intentar con 1 sola prenda**.
   - `POST /planning` (fijar próximo) → `PUT /planning/confirm` → `GET /planning`.
   - Crear un segundo `planning` → **verificar que el anterior pasa a `cancelled`** (1 solo activo).
   - `DELETE /clothes/:id` → **verificar archivado lógico** (no borrado físico).
4. Afirmar cada regla de negocio (PASS/FAIL).

## Salida
- Reporte en el chat: tabla paso → request → IDs → status code → PASS/FAIL por aserción → veredicto.

## Guardarraíles
- **Solo HTTP** contra endpoints públicos; **no** tocar la DB directamente (viola las capas).
- Solo contra **DB local** (docker); nunca dev/prod.
- Usar el `userId` fijo del guard `@CurrentUser` (single-user MVP).
- Guardar payloads en el scratchpad; **no** correr la suite Jest completa.
- Dejar anotado cómo bajar el stack al terminar (`docker compose down`, matar el proceso de la API).
