---
title: Pantalla 04 · Nueva prenda (formulario de creación)
status: shipped
size_class: small
owner: @frontend-mobile
ticket: RDY-NUEVA-PRENDA-04
created: 2026-07-04
last_updated: 2026-07-04
---

# Pantalla 04 · Nueva prenda (formulario de creación)

- **Status:** shipped
- **Size class:** small
- **Owner:** @frontend-mobile
- **Ticket:** RDY-NUEVA-PRENDA-04

> Adapta la pantalla de **alta de prenda** al diseño Claude Design **04 · Nueva prenda**:
> top bar (Cancelar / título / Guardar), dropzone de foto con estética de "agregá una foto",
> inputs con placeholder y barra inferior "Guardar prenda". Cambio solo frontend; reusa el
> `ClothingItemForm` compartido y el `useCreateClothingItem` ya existente.

## Problema

La pantalla de alta ya funciona (crea prendas vía el form compartido), pero visualmente no
sigue el diseño 04: no tiene el top bar con Cancelar/Guardar ni el dropzone de foto del
mockup, y usa el header nativo de navegación en lugar del propio de la pantalla.

## Goals

- El alta de prenda muestra el **top bar** del diseño 04: "Cancelar" (izq), "Nueva prenda"
  (título serif centrado), "Guardar" (der) — Guardar dispara el submit.
- **Dropzone de foto** estilo 04: círculo `＋`, "Agregá una foto", "Cámara o galería".
- Barra inferior con botón primario **"Guardar prenda"**.
- El botón "Cancelar" cierra la pantalla sin crear nada.
- **Color** como swatches circulares (círculo por color del catálogo, anillo en el
  seleccionado), no chips de texto.
- **Tags** con `TagSelector`: tags existentes toggleables + "+ Agregar tag" que crea uno
  nuevo (`POST /clothes/tags`) y lo selecciona.
- El `Guardar` del top bar queda **gris/deshabilitado** hasta que el form es válido (no un
  segundo botón azul redundante con "Guardar prenda").
- **Categoría** como **select desplegable** ("Elegí una categoría ▾" → hoja modal con las
  opciones), no chips.
- **Nombre / Descripción**: inputs blancos con borde (no relleno), con los placeholders del
  mockup ("Ej: Camisa de lino blanca", "Añadí una nota sobre la prenda (opcional)").
- **Edición (03)** unificada bajo el **mismo modal 04** (top bar Cancelar/Editar prenda/Guardar):
  crear y editar comparten `ClothingItemForm` sección por sección.

## Non-goals

- No se cambia el contrato del backend (crear y tags ya existen: `POST /clothes`,
  `POST /clothes/tags`).
- No se agrega creación de **colores** custom (el `＋` del mockup): no hay endpoint de color.
- No se rediseña la pantalla de edición (03) en este PR (aunque hereda swatches/tags por
  compartir el form).

## Módulos / servicios afectados

- `apps/mobile` — feature `clothes`:
  - `components/ClothingItemForm.tsx` — top bar opcional (`title` + `onCancel`) y dropzone 04.
  - `screens/AddClothingItemScreen.tsx` — pasa `title`/`onCancel`; sin header nativo.
  - `navigation/RootNavigator.tsx` — `AddClothingItem` con `headerShown: false`.

## Contratos afectados

Ninguno. Usa `useCreateClothingItem` → `POST /clothes` ya existente.

## Impacto backend

Ninguno.

## Impacto frontend

El alta usa un top bar propio (Cancelar/Guardar) y el dropzone de foto del diseño 04. El form
sigue siendo el `ClothingItemForm` compartido; el top bar es **opt-in** (solo se muestra si se
pasa `title`), así que la edición (03) no cambia.

## Impacto de base de datos

Ninguno.

## Edge cases

- Guardar con el form inválido → RHF muestra los errores; no navega.
- Cancelar → vuelve sin crear.
- Foto opcional → se puede guardar sin foto.

## Criterios de aceptación

- [x] El alta muestra el top bar con "Cancelar", "Nueva prenda" y "Guardar".
- [x] "Cancelar" dispara `onCancel` (cierra la pantalla).
- [x] "Guardar" (top bar) y "Guardar prenda" (barra inferior) disparan el mismo submit.
- [x] El dropzone de foto muestra "Agregá una foto" cuando no hay imagen.
- [x] El color se elige por swatches circulares; el seleccionado queda marcado.
- [x] Los tags se listan como chips toggleables y "+ Agregar tag" crea + selecciona uno nuevo.
- [x] El `Guardar` del top bar está deshabilitado/gris hasta que el form es válido.
- [x] La categoría se elige con un select desplegable (placeholder + opciones en modal).
- [x] Nombre y Descripción son inputs blancos con borde y los placeholders del mockup.
- [x] La edición (03) usa el mismo modal 04 (top bar), compartiendo el form con la creación.
- [x] `npm run typecheck` + `npm test` (mobile) pasan.

## Plan de test

- **Mobile:** `ClothingItemForm` — con `title` renderiza el top bar; "Cancelar" llama
  `onCancel`; "Guardar" del top bar dispara `onSubmit`. (Los tests previos de prefill/submit
  siguen valiendo.)

## Rollout

- Solo mobile; sin migración. Rollback = revertir el PR.

## Preguntas abiertas

- [ ] Q: ¿Unificar también la edición (03) bajo el mismo top bar? Owner: @frontend-mobile.
      **Decisión:** fuera de este PR (scope acotado a creación).
