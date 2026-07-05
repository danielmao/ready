---
title: Outfits (dominio Outfits) — crear, modificar y eliminar conjuntos
status: shipped
size_class: medium
owner: @backend-architect
ticket: no aplica (sin tickets en el MVP)
created: 2026-07-04
last_updated: 2026-07-04
---

# Outfits (dominio Outfits) — crear, modificar y eliminar conjuntos

- **Status:** shipped (backend + mobile; e2e local + `jest src/outfits` + `lint:arch` verdes 2026-07-04)
- **Size class:** medium (nuevo dominio + contratos HTTP nuevos, pero **sin migración** —las
  tablas ya existen— y copiando el patrón DDD ya probado en `clothes`; no toca auth ni rompe
  contratos existentes)
- **Owner:** @backend-architect
- **Ticket:** no aplica (sin tickets en el MVP)
- **Created:** 2026-07-04

> Spec del "qué". Es el **2º dominio del MVP** (`clothes → outfits → planning`). Reusa la base
> ya en pie: Prisma/Postgres, guard `@CurrentUser`, `Paginated<T>` y —clave— la `ClothesFacade`
> para validar prendas. El `## Technical design` lo completa el Backend Architect.

## Problema

Hoy el usuario puede gestionar su **armario** (`clothes`) pero no puede **combinar** prendas en
conjuntos reutilizables. Sin el dominio `outfits` el core flow `Prendas → Outfits → Outfit listo`
se corta en el primer eslabón: no hay `Outfit` que después `planning` pueda marcar como "próximo
outfit activo". Falta la entidad `Outfit` (nombre + ≥2 prendas ordenadas + occasions/tags) y sus
endpoints CRUD.

## Goals

- El usuario puede **crear** un outfit combinando **≥2 prendas** de su armario (`POST /api/outfits`).
- El usuario puede **listar** y **ver** sus outfits con las prendas resueltas
  (`GET /api/outfits`, `GET /api/outfits/:id`).
- El usuario puede **modificar** un outfit: nombre, occasions/tags y **el set de prendas**
  (`PUT /api/outfits/:id`).
- El usuario puede **eliminar** un outfit (archivado lógico `isActive=false`, `DELETE /api/outfits/:id`).
- Cada `clothingItemId` se **valida contra `ClothesFacade`** (existe, activo, del usuario) antes
  de componer; nunca se toca la tabla de prendas directamente.
- El dominio queda scaffoldeado con el patrón DDD por capas (`/new-domain`) y expone
  `OutfitsFacade` para que `planning` lo consuma después.
- `npm run lint:arch` pasa y hay spec de cada use-case con lógica (reglas de test §4).
- Mobile: el usuario puede crear, ver, editar y eliminar outfits desde una pantalla de outfits.

## Non-goals

- **No** incluye `planning` (marcar el "próximo outfit"): se deja `OutfitsFacade` para que lo
  consuma. Fuera de alcance el `PlannedOutfit`.
- **No** endpoints item-level separados (`POST /api/outfits/:id/items`,
  `DELETE .../items/:itemId` de `docs/04`): el set de prendas se edita **entero** vía
  `PUT /api/outfits/:id` (`outfitItems`). Se documenta la divergencia respecto de `docs/04`
  (ver Preguntas abiertas). Los endpoints item-level quedan como roadmap si hiciera falta.
- **No** migración Prisma: las tablas `outfits`/`outfit_items`/`outfit_occasions`/`outfit_tags`
  ya se sembraron con el esquema MVP en el dominio `clothes`.
- **No** sugerencias por clima/ocasión ni historial (`OutfitHistory`) — Épicas 2/3.
- **No** foto/collage del outfit compuesto: la card muestra las fotos de sus prendas.
- **No** paginación con cursor: offset (`page`/`limit`) como en `clothes` y `docs/04`.

## Módulos / servicios afectados

- `apps/backend` — **nuevo dominio** `src/outfits/` (domain/application/infrastructure),
  scaffoldeado con `/new-domain`.
- `apps/backend/src/app.module.ts` — importa `OutfitsModule`.
- `apps/backend/src/clothes/infrastructure/clothes.module.ts` — ya **exporta** `ClothesFacade`
  (sin cambios; se **importa** desde `OutfitsModule`).
- `apps/mobile` — **nuevo** feature `src/features/outfits/` (lista + detalle + crear/editar +
  eliminar), navegación y `outfitsApi`.
- **Sin cambios** en `prisma/schema.prisma` (tablas ya existen) ni en el guard `@CurrentUser`.

## Contratos afectados

| Tipo | Superficie | Cambio | ¿Rompe? | Consumidores |
|---|---|---|---|---|
| HTTP | `GET/POST/PUT/DELETE /api/outfits` | nuevo | no | `apps/mobile` (outfitsApi) |
| HTTP | `GET /api/outfits/:id` | nuevo | no | `apps/mobile` |
| Facade interna | `OutfitsFacade` en `src/outfits/application/facades` | nuevo | no | `planning` (feature siguiente) |
| Facade interna | `ClothesFacade.findExistingActiveItemIds` | **consumido** (ya existe) | no | `outfits` (este dominio) |
| DB | `outfits`, `outfit_items`, `outfit_occasions`, `outfit_tags` | ninguno (ya migradas) | no | backend |
| Tipo compartido | ninguno nuevo (`Paginated<T>` reutilizado) | — | no | — |

## Impacto backend

Nuevo dominio `outfits` con `infra → application → domain`, calcado de `clothes`:
- **domain**: entidad plana `Outfit` (id, userId, name, isActive, items ordenados, occasions,
  tags) y `OutfitItem` (clothingItemId, order). Sin dependencias de framework.
- **application**: `OutfitRepository` (contrato con token SYMBOL); use-cases de un `execute()`
  (`create-outfit`, `list-outfits`, `get-outfit`, `update-outfit`, `archive-outfit`); dtos con
  class-validator (`CreateOutfitDto` con `@ArrayMinSize(2)` sobre `outfitItems`); `OutfitsFacade`
  (superficie pública para `planning`: `findActiveOutfitById`). La validación de prendas se hace
  llamando a `ClothesFacade.findExistingActiveItemIds` y comparando contra los ids pedidos.
- **infrastructure**: `OutfitsController` delgado, `PrismaOutfitRepository` en
  `persistence/repositories` (único lugar que toca `@prisma/client`; escribe los joins
  `outfit_items`/`outfit_occasions`/`outfit_tags` transaccionalmente), `OutfitsModule` que
  **importa** `ClothesModule` (para inyectar `ClothesFacade`) y exporta sólo `OutfitsFacade`.

## Impacto frontend

Nuevo feature `outfits` en `apps/mobile`: pantalla **lista de outfits** (cards con las fotos de
sus prendas), **detalle**, y un **flujo crear/editar** que reusa el picker de prendas del armario
(seleccionar ≥2 prendas de `GET /api/clothes`, ordenar, nombrar, elegir occasions/tags) y permite
**eliminar**. Estado servidor con TanStack Query (`useOutfits`, `useOutfit`, mutations que
invalidan la lista); formulario con RHF + Zod (mínimo 2 prendas). Nueva entrada de navegación
"Outfits". Sin Zustand salvo el borrador de selección de prendas si hiciera falta.

## Impacto de base de datos

**Ninguno.** Las tablas `outfits`, `outfit_items`, `outfit_occasions`, `outfit_tags` ya fueron
creadas por la migración inicial del dominio `clothes` (esquema MVP completo). Este dominio sólo
agrega código que las escribe/lee. Sin seed nuevo.

## Edge cases

- `POST /api/outfits` con `<2` `outfitItems` → `400` (`@ArrayMinSize(2)`).
- `POST/PUT` con un `clothingItemId` inexistente / archivado / de otro usuario → `400`
  (se compara lo pedido contra `ClothesFacade.findExistingActiveItemIds`; falta ⇒ error).
- `POST/PUT` con `clothingItemId` **duplicado** dentro del mismo outfit → `400`
  (viola `@@unique([outfitId, clothingItemId])`; se valida antes en el use-case).
- `POST/PUT` con `occasionId`/`tagId` inexistente → `400`/`404` (validar contra catálogo vía
  `ClothesFacade`/repo de catálogo — ver Preguntas abiertas sobre quién valida catálogos).
- `GET /api/outfits/:id` de un outfit archivado o de otro usuario → `404`.
- `PUT /api/outfits/:id` que deja `<2` prendas → `400` (nunca puede quedar por debajo del mínimo).
- `DELETE /api/outfits/:id` → archiva (`isActive=false`), no borra; deja de listarse.
- Eliminar/archivar una **prenda** que está en un outfit → **fuera de alcance** este spec (no se
  cascadea a outfits en el MVP; se anota como pregunta abierta con owner).
- `GET /api/outfits` filtrado por `clothingId` → devuelve outfits que contienen esa prenda.

## Criterios de aceptación

- [ ] `POST /api/outfits` con `name` + 2 `outfitItems` válidos → `201` con `id`, `items`
      resueltos (cada uno con su `clothingItem`), `isActive:true`.
- [ ] `POST /api/outfits` con 1 sólo item → `400`.
- [ ] `POST /api/outfits` con un `clothingItemId` ajeno/archivado → `400`.
- [ ] `GET /api/outfits` lista los outfits activos del usuario, paginado `{data,total,page,limit}`.
- [ ] `GET /api/outfits/:id` devuelve el outfit con `items` ordenados, `occasions`, `tags`;
      `404` si no existe/archivado/ajeno.
- [ ] `PUT /api/outfits/:id` cambia `name`, `occasionIds`, `tagIds` y **el set de `outfitItems`**;
      rechaza (`400`) si el nuevo set tiene `<2` prendas o una inválida.
- [ ] `DELETE /api/outfits/:id` → `{success:true}` y el outfit deja de aparecer en el listado.
- [ ] `npm run lint:arch` pasa (sin violaciones de capas/facade; `outfits` cruza a `clothes`
      **sólo** vía `ClothesFacade`).
- [ ] `npx jest src/outfits --no-coverage` pasa (specs de create/update/archive/list).
- [ ] Mobile: crear un outfit con 2 prendas lo muestra en la lista; editarlo y eliminarlo se
      reflejan tras refrescar.

## Plan de test

- **Unit:** specs de los use-cases con lógica: `create-outfit` (valida ≥2 prendas + existencia
  vía facade + no duplicados), `update-outfit` (recomposición del set + mínimo 2), `archive-outfit`
  (archivado lógico), `list-outfits` (filtros + paginación). Spies sobre `OutfitRepository` y
  `ClothesFacade` (no Prisma real). 1–2 asserts por comportamiento; `jest.clearAllMocks()` en
  `afterEach`.
- **E2E:** `/e2e-local` — flujo HTTP real: crear 2 prendas (clothes) → crear outfit con ellas →
  listar → ver → editar (cambiar nombre + set) → eliminar → verificar que no aparece. DB local docker.
- **Mobile:** smoke manual de lista + crear + editar + eliminar contra la API local.

## Rollout

- **Feature flag:** no aplica en MVP.
- **Orden de despliegue:** backend (dominio, sin migración) → mobile. No requiere paso de DB.
- **Rollback:** revertir el merge. Sin migración que revertir; los datos en `outfits` son de
  prueba (no productivos). Archivado lógico ⇒ nada se borra físicamente.

## Preguntas abiertas

- [x] Q: ¿Endpoints item-level (`POST/DELETE /api/outfits/:id/items`) o edición del set entero
      vía `PUT`? → **Set entero vía `PUT`** en el MVP (más simple, un solo contrato; el mobile
      manda el array completo). Divergencia respecto de `docs/04` documentada; item-level = roadmap.
      Owner: @backend-architect.
- [ ] Q: ¿Quién valida que `occasionId`/`tagId` existen — `ClothesFacade` (dueño de catálogos) o
      un método nuevo en la facade? → Propuesta: **extender `ClothesFacade`** con
      `findExistingOccasionIds`/`findExistingTagIds` (los catálogos son de `clothes`). Confirmar
      en Technical design. Owner: @backend-architect.
- [ ] Q: Al archivar una **prenda** que está dentro de outfits, ¿qué pasa con esos outfits? →
      Propuesta MVP: **no cascada** (el outfit puede quedar con una prenda archivada; se resuelve
      al mostrarla). Cascada/aviso = roadmap. Owner: @backend-architect.
- [ ] Q: ¿La card de outfit en mobile muestra collage de fotos o sólo nombre + count? → Propuesta:
      **tira de miniaturas** de las prendas. Confirmar con el diseño. Owner: @frontend-mobile.

---

## Technical design

> Resuelto por el **Backend Architect** (2026-07-04).

### Resumen del enfoque

`outfits` es el **segundo dominio**: reusa la base de `clothes` (Prisma, guard `@CurrentUser`,
`Paginated<T>`) y la valida como consumidor. La composición se valida en un service interno
(`OutfitValidationService`) que cruza a `clothes` **sólo** vía `ClothesFacade` (extendida con
`findExistingOccasionIds/TagIds`, ya que los catálogos son de `clothes`). El repo Prisma escribe
los joins (`outfit_items/occasions/tags`) y en `update` los reemplaza en una transacción para no
dejar sets a medias. El set de prendas se edita **entero vía `PUT`** (no item-level en MVP).

**Decisión de wiring:** el DI cross-dominio requería importar `ClothesModule` (infraestructura),
lo que viola `cross-domain-only-via-facade`. Se resolvió marcando `ClothesModule` (y `OutfitsModule`)
como **`@Global`**: la facade —única superficie pública— queda inyectable sin importar el módulo
ajeno. Registrado en `docs/02-ARCHITECTURE.md §2`.

**Mobile:** la feature nace con el patrón **controller-hook** (`CODING-CONVENTIONS.md §5`):
`useOutfitForm` / `useOutfitsListController` / `useOutfitDetailController` concentran la lógica;
las vistas (`OutfitForm`, `*Screen`) son presentacionales.

### Plan de ejecución

> Entregado en la rama `feat/outfits-domain` (sale de `feature-entrega2-dmtu`) como un conjunto
> de commits acotados (sin PRs por fila en el MVP).

| # | Fase | Área | Cambio | Depende de | Estado |
|---|---|---|---|---|---|
| 1 | Dominio | backend | dominio outfits DDD (CRUD) + `OutfitsFacade` + `ClothesFacade` extendida + `@Global` | — | merged |
| 2 | Tests | backend | specs create/update (jest) | #1 | merged |
| 3 | E2E | backend | flujo HTTP outfits (10 pasos + edge cases PASS) | #1 | merged |
| 4 | Patrón mobile | mobile/docs | convención controller-hook (§5) + refactor `ClothingItemForm`→`useClothingItemForm` | — | merged |
| 5 | Mobile | mobile | feature outfits (lista/detalle/crear/editar/eliminar) con controller-hooks | #1,#4 | merged |
| 6 | Docs | docs | arch regenerada (`outfits→clothes`) + API spec sincronizada | #1 | merged |

### Riesgos

| Riesgo | Severidad | Mitigación |
|---|---|---|
| `@Global` filtra más de la facade | low | Los módulos exportan **sólo** la facade; `@Global` sólo hace global lo exportado. |
| Editar set entero pisa el orden por error | low | `order` derivado del índice de selección; transacción en `update`. Cubierto por e2e paso 6. |
| Prenda archivada dentro de un outfit | med | Fuera de alcance MVP (sin cascada); anotado en Preguntas abiertas. |

### UX — Outfit builder (definido por el Product UX Architect, 2026-07-04)

La pantalla de crear/editar outfit (`OutfitForm`) debe escalar cuando el usuario tiene muchas
prendas. Decisiones para el MVP (implementadas):

- **Buscador siempre visible** (`SearchBar`) + **filtro por categoría** (`FilterChips`): usan
  `GET /api/clothes?search=&categoryId=` (ya existente). Antes el buscador era inaccesible (el
  controller filtraba pero la vista no lo renderizaba) — corregido.
- **Bandeja "Tu outfit"**: tira horizontal fija con las prendas ya elegidas en orden, con quitar
  rápido (`removeItem`) y contador con la regla de mínimo 2. No scrollea con la grilla, para no
  perder de vista el conjunto mientras se busca.
- **Resolución de seleccionadas contra una caché** (`knownItems`) en `useOutfitForm`: evita que
  la bandeja se vacíe al filtrar (el filtro achica la grilla, pero la elegida sigue en el outfit).
- **Empty states diferenciados**: "armario vacío" (sin filtro) vs "sin resultados" (con filtro).
- **Roadmap** (fuera del MVP): reordenar por drag-and-drop, filtros por color/ocasión dentro del
  picker, sugerencias/"completá el look".

Toda la lógica vive en el controller `useOutfitForm` (patrón controller-hook, `CODING-CONVENTIONS.md §5`).
