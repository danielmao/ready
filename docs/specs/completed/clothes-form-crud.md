---
title: Formulario crear/editar prenda (03) + CRUD de prendas en backend
status: shipped
size_class: medium
owner: @frontend-mobile
ticket: RDY-CLOTHES-FORM-CRUD
created: 2026-07-04
last_updated: 2026-07-04
---

# Formulario crear/editar prenda (03) + CRUD de prendas en backend

- **Status:** shipped
- **Size class:** medium
- **Owner:** @frontend-mobile
- **Ticket:** RDY-CLOTHES-FORM-CRUD
- **Created:** 2026-07-04

> Implementa la pantalla **03 · Editar prenda** del diseño Claude Design como un formulario
> **compartido crear + editar**, y asegura el CRUD de prendas en el backend (crear / actualizar
> / archivar) con cobertura de tests. TDD en ambos lados.

## Problema

El armario ya lista y muestra el detalle de prendas (rediseño previo), pero desde el detalle
el botón "Editar" no hacía nada y no existía pantalla de edición. En mobile solo había alta
(`AddClothingItemScreen`) con su lógica de form embebida; no había forma de **actualizar** una
prenda ni un método `update` en la API cliente. En backend, los use-cases de crear/actualizar/
archivar existían y estaban cableados, pero **`update` no tenía test** (crear y archivar sí).

## Goals

- **03 · Editar/Crear prenda:** un `ClothingItemForm` reutilizable (foto, nombre, categoría,
  color, ocasiones, descripción) que sirve tanto para alta como para edición, estilo diseño 03.
- **Editar** desde el detalle: el botón "Editar" navega a `EditClothingItem`, que precarga la
  prenda y guarda con `PUT /clothes/:id`.
- **API + estado:** `clothesApi.update` y `useUpdateClothingItem` (invalida lista y detalle).
- **Backend CRUD garantizado:** crear/actualizar/archivar con tests (se añade el spec faltante
  de `UpdateClothingItemUseCase`).

## Non-goals

- No se agregan tags editables al form (el alta ya los omitía; queda como follow-up).
- No se cambia el contrato HTTP existente (`PUT /clothes/:id` ya existía).
- No se implementa "Usar en un outfit" (Épica outfits).

## Módulos / servicios afectados

- `apps/mobile` — feature `clothes`:
  - `components/ClothingItemForm.tsx` (**nuevo**, extraído del alta, restyleado)
  - `screens/AddClothingItemScreen.tsx` (adelgazado → usa el form)
  - `screens/EditClothingItemScreen.tsx` (**nuevo**)
  - `services/clothesApi.ts` (`update`), `hooks/useClothes.ts` (`useUpdateClothingItem`)
  - `domain/models/clothing.ts` (`UpdateClothingItemInput`)
  - `navigation/*` (ruta `EditClothingItem`), `ClothingDetailScreen` (botón Editar)
- `apps/backend` — `clothes`:
  - `application/use-cases/update-clothing-item.use-case.spec.ts` (**nuevo**, TDD)

## Contratos afectados

| Tipo | Superficie | Cambio | ¿Rompe? | Consumidores |
|---|---|---|---|---|
| HTTP | `PUT /api/clothes/:id` | ya existente — ahora lo consume mobile | no | `apps/mobile` (`clothesApi.update`) |

Crear (`POST /clothes`) y archivar (`DELETE /clothes/:id`) sin cambios.

## Impacto backend

Ninguno de comportamiento: los use-cases de crear/actualizar/archivar ya existían y respetaban
`infra → application → domain` (validación de catálogos vía `CatalogValidationService`, persistencia
por repositorio). Solo se agrega el **test** de `UpdateClothingItemUseCase` para cerrar la brecha
de cobertura.

## Impacto frontend

Se extrae el form a `ClothingItemForm` (crear + editar), la edición precarga con
`useClothingItem` y guarda con `useUpdateClothingItem` (TanStack Query; invalida lista + detalle).

## Impacto de base de datos

Ninguno.

## Edge cases

- Editar prenda inexistente / de otro usuario → `PUT` devuelve 404 (`NotFoundException`).
- Cambiar a categoría/color/ocasión inexistente → 400 (validación de catálogos).
- Guardar sin cambiar la foto → conserva la `imageUrl` inicial.
- Prenda sin ocasiones → el form arranca con lista vacía.

## Criterios de aceptación

- [x] El botón "Editar" del detalle navega a `EditClothingItem` con el `id`.
- [x] `EditClothingItem` precarga la prenda y, al guardar, llama `update.mutate({id, input})`.
- [x] `clothesApi.update` hace `PUT /clothes/:id` con el body.
- [x] `AddClothingItemScreen` sigue creando prendas reusando `ClothingItemForm`.
- [x] Backend: crear/actualizar/archivar cubiertos por tests; `update` valida catálogos y 404.
- [x] `npm run typecheck` + `npm test` (mobile) y `jest src/clothes` + `lint:arch` (backend) pasan.

## Plan de test

- **Mobile:** `clothesApi.update` (PUT), `ClothingItemForm` (prefill + submit),
  `EditClothingItemScreen` (loading + update.mutate con id/input).
- **Backend:** `UpdateClothingItemUseCase` (valida solo catálogos presentes, 404, no persiste
  ante error de catálogo).

## Rollout

- Solo mobile + un test de backend; sin migración. Deploy backend reejecutable desde la rama
  para confirmar health (el contrato no cambió).
- Rollback: revertir el PR.

## Preguntas abiertas

- [ ] Q: ¿Sumar tags editables al form (chips con crear libre)? Owner: @frontend-mobile.
      **Decisión:** follow-up; fuera de este PR para mantener paridad con el alta previa.
