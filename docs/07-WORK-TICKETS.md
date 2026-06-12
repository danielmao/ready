# 07 · Tickets de trabajo

> Expansión de la sección 6 del [README](../README.md). Estimación: S/M/L.

## Backlog del MVP

| ID | Tipo | Título | HU | Est. |
|----|------|--------|----|-----:|
| RDY-1 | Infra | Scaffolding backend NestJS + Prisma + Docker Postgres | — | M |
| RDY-2 | Infra | Scaffolding mobile RN + navegación (tabs/stacks/modales) | — | M |
| RDY-3 | Backend | Módulo `clothes`: CRUD + catálogos | HU-01,02,08 | L |
| RDY-4 | Backend | Módulo `outfits`: CRUD + items (regla ≥2) | HU-03,06 | L |
| RDY-5 | Backend | Módulo `planning`: 1 activo, confirm, cancel | HU-04,05 | M |
| RDY-6 | Mobile | Tab Prendas: lista + filtros + detalle + alta (modal) | HU-01,02 | L |
| RDY-7 | Mobile | Tab Outfits: lista + detalle + alta (selector) | HU-03,06 | L |
| RDY-8 | Mobile | Tab Planear: ver/cambiar/confirmar | HU-04,05 | M |
| RDY-9 | QA | Tests unit (dominio) + e2e (HTTP) | — | M |
| RDY-10 | Mobile | Búsqueda avanzada (SearchStack) | HU-07 | S |
| RDY-11 | Backend | Seeds de catálogos + user fijo | — | S |

## Ejemplo de ticket detallado

### RDY-4 — Módulo `outfits`: CRUD + items

**Descripción:** Implementar el módulo `outfits` en NestJS (DDD) con persistencia
Prisma, exponiendo el CRUD de outfits y la gestión de sus items.

**Criterios de aceptación:**
- `POST /api/outfits` crea un outfit con ≥2 `outfitItems`; con menos devuelve `400`.
- No se permite la misma prenda dos veces en un outfit (unique `outfitId+clothingItemId`).
- `DELETE /api/outfits/:id` archiva (no borra); `DELETE .../items/:itemId` valida que
  queden ≥2 items.
- La invariante "≥2 prendas" vive en la **entidad de dominio**, no sólo en el DTO.

**Tareas:**
1. `Outfit` y `OutfitItem` en `schema.prisma` + migración.
2. Entidades de dominio con la regla ≥2.
3. Casos de uso: create, update, archive, addItem, removeItem.
4. Repositorios Prisma + mappers.
5. Controller + DTOs (`class-validator`).
6. Tests unit (regla ≥2) + e2e (crear/editar/archivar).

**Definición de hecho:** tests verdes, Prettier aplicado, endpoint documentado en Swagger.

## Roadmap (post-MVP)
RDY-R1 calendario · RDY-R2 historial · RDY-R3 ratings · RDY-R4 sugerencias ·
RDY-R5 auth Google + sync.
