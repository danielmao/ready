---
title: Rediseño de pantallas mobile del armario (armario, estado vacío, detalle)
status: shipped
size_class: medium
owner: @frontend-mobile
ticket: RDY-REDISEÑO-ARMARIO
created: 2026-07-04
last_updated: 2026-07-04
---

# Rediseño de pantallas mobile del armario (armario, estado vacío, detalle)

- **Status:** shipped
- **Size class:** medium
- **Owner:** @frontend-mobile
- **Ticket:** RDY-REDISEÑO-ARMARIO
- **Created:** 2026-07-04

> Rediseño visual de tres pantallas del flujo **Prendas** a partir del diseño Claude Design
> `Ready.dc.html` (proyecto claude.ai/design "ready"). Es un cambio **solo frontend**: no toca
> backend, contratos HTTP ni base de datos. Se implementa con **TDD** (jest +
> `@testing-library/react-native`), que hoy no existe en `apps/mobile` y se monta como parte
> de esta feature.

## Problema

Las pantallas actuales del armario (`ClothesListScreen`, `EmptyState`) son funcionales pero
planas: la lista es un `FlatList` de tarjetas horizontales sin jerarquía visual, el estado
vacío es un texto centrado sin identidad de marca, y **no existe** pantalla de detalle de
prenda (al tocar una tarjeta no pasa nada). El diseño aprobado en Claude Design define una
identidad clara (tipografía serif de marca, grid tipo lookbook, ficha de detalle rica) que
hoy el código no refleja. Además el proyecto no tiene test runner, así que ningún cambio de UI
se puede blindar con tests.

## Goals

- **01 · Mi armario:** grid de 2 columnas (tarjeta vertical: foto 3/4, nombre, chip de
  categoría, dot de color), header de marca ("Ready" + título serif "Mi armario"), buscador,
  chips de filtro por categoría y FAB `+`.
- **01b · Estado vacío:** ilustración de percha, título serif "Tu armario está vacío",
  subtítulo y CTA "Agregá tu primera prenda" que abre el alta.
- **02 · Detalle de prenda:** foto full-bleed con botón back y favorito, ficha con color,
  descripción, ocasiones y tags, y barra de acción (Usar en un outfit / Editar / Archivar).
  Se navega tocando una tarjeta del grid.
- Montar **TDD**: jest + `@testing-library/react-native`, con tests que cubran los
  criterios de aceptación de las tres pantallas.

## Non-goals

- No se toca el backend, ni contratos HTTP, ni el modelo de datos.
- No se implementa el flujo real de "Usar en un outfit", "Editar" ni "Archivar" desde el
  detalle más allá de dejar los botones cableados a los handlers/navegación existentes
  (outfits es Épica siguiente; editar/archivar puede quedar como TODO acotado).
- No se agrega carrusel multi-foto real (varias imágenes) — se muestra la foto de portada;
  el carrusel del mockup se aproxima con la foto principal.
- No se incorpora búsqueda/filtrado server-side nuevo: el buscador y los chips usan los
  parámetros de listado ya existentes (`search`, `categoryId`).

## Módulos / servicios afectados

- `apps/mobile` — feature `clothes`:
  - `src/features/clothes/screens/ClothesListScreen.tsx` (rediseño)
  - `src/features/clothes/screens/ClothingDetailScreen.tsx` (**nueva**)
  - `src/features/clothes/components/ClothingCard.tsx` (rediseño a tarjeta vertical)
  - `src/features/clothes/components/WardrobeEmptyState.tsx` (**nueva**, específica del armario)
  - `src/features/clothes/components/FilterChips.tsx`, `SearchBar.tsx` (**nuevas**, auxiliares)
  - `src/navigation/RootNavigator.tsx` + `src/navigation/types.ts` (ruta `ClothingDetail`)
  - `src/theme.ts` (tokens de tipografía serif/sans)
- `apps/backend` — **ninguno**.

## Contratos afectados

Ninguno. El rediseño consume los endpoints y tipos ya existentes (`clothesApi.list`,
`clothesApi.getById`, `ClothingItem`, catálogos). No cambia ningún shape HTTP/DB/tipo
compartido.

## Impacto backend

Ninguno. Cambio puramente de presentación en `apps/mobile`.

## Impacto frontend

Rediseño de la feature `clothes` en mobile. Estado servidor sigue vía **TanStack Query**
(`useClothes`, `useCatalogs`, y `getById` para el detalle). Estado local: texto del buscador
y chip de categoría seleccionado (local a la pantalla). El usuario ve un armario tipo lookbook
en grid, un estado vacío con identidad de marca, y por primera vez puede abrir el **detalle**
de una prenda desde el grid. Se añade el runner de tests (jest-expo) para blindar la UI.

## Impacto de base de datos

Ninguno.

## Edge cases

- Armario sin prendas → se muestra `WardrobeEmptyState` (01b), no el grid.
- Prenda sin foto → la tarjeta y el detalle muestran un placeholder (ícono de categoría).
- Prenda sin color / sin ocasiones / sin tags → esas secciones no se renderizan (no vacío feo).
- Búsqueda sin resultados → estado vacío de "sin resultados" distinto del armario vacío.
- Error de red al cargar lista/detalle → estado de error con botón "Reintentar".
- Nombre muy largo → truncado a 1–2 líneas en la tarjeta.

## Criterios de aceptación

- [x] **01** El grid renderiza una tarjeta por prenda con nombre, chip de categoría y dot de
      color (cuando hay color), en 2 columnas.
- [x] **01** El header muestra "Ready" y el título "Mi armario"; hay buscador y chips de
      filtro por categoría; el FAB navega a `AddClothingItem`.
- [x] **01** Tocar una tarjeta navega a `ClothingDetail` con el `id` de la prenda.
- [x] **01b** Con lista vacía se muestra la ilustración de percha, el título "Tu armario está
      vacío" y el CTA que navega a `AddClothingItem`.
- [x] **02** El detalle muestra foto (o placeholder), nombre, categoría, color, descripción,
      ocasiones y tags cuando existen, y oculta las secciones sin datos.
- [x] **02** El detalle tiene botón back (vuelve) y barra de acción con "Usar en un outfit",
      "Editar" y "Archivar".
- [x] `npm run typecheck` pasa y `npm test` (jest) pasa con los specs de estas pantallas.

## Plan de test

- **Unit / componentes (jest + @testing-library/react-native):**
  - `ClothingCard` — muestra nombre/categoría/color, dispara `onPress`, placeholder sin foto.
  - `WardrobeEmptyState` — título/subtítulo/CTA, dispara `onPressAdd`.
  - `ClothesListScreen` — grid con datos, empty state sin datos, FAB navega (mockeando hooks).
  - `ClothingDetailScreen` — renderiza campos de una prenda mock, oculta secciones vacías,
    back y acciones cableadas.
- **E2E:** manual en simulador/Expo (fuera de CI en el MVP); `npm run typecheck` en CI local.

## Rollout

- Feature flag: no aplica (MVP).
- Orden de despliegue: solo mobile; el backend no cambia. El "deploy" del backend se
  reejecuta desde la rama para verificar que sigue sano (no incluye cambios de servidor).
- Rollback: revertir el PR (cambio aislado a `apps/mobile`).

## Preguntas abiertas

- [x] Q: ¿Se cargan las fuentes de marca (Cormorant Garamond / Archivo) vía
      `@expo-google-fonts`, o se aproxima con `serif`/`System` para no ampliar el scope?
      Owner: @frontend-mobile. **Decisión de arranque:** aproximar con familia `serif` para
      los títulos y system sans para UI; dejar las Google Fonts como mejora posterior si el
      install de deps nativas es viable.
- [x] Q: ¿"Editar" y "Archivar" desde el detalle se implementan ahora o quedan cableados a
      TODO? Owner: @frontend-mobile. **Decisión de arranque:** "Archivar" usa el hook ya
      existente `useArchiveClothingItem`; "Editar" y "Usar en un outfit" quedan como TODO
      acotado (fuera del alcance de este rediseño visual).
