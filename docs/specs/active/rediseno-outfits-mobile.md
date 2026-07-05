---
title: Rediseño de pantallas mobile de outfits + tabs de navegación
status: in-progress
size_class: medium
owner: @frontend-mobile
ticket: RDY-REDISEÑO-OUTFITS
created: 2026-07-05
last_updated: 2026-07-05
---

# Rediseño de pantallas mobile de outfits + tabs de navegación

- **Status:** in-progress
- **Size class:** medium
- **Owner:** @frontend-mobile
- **Ticket:** RDY-REDISEÑO-OUTFITS

> Rediseño visual del flujo **Outfits** a partir del mismo Claude Design `Ready.dc.html`
> (proyecto claude.ai/design "ready") que dio el rediseño del armario, y montaje de la
> **barra de tabs** (Armario · Outfits · Perfil) que el diseño define para la transición entre
> pantallas. Es un cambio **solo frontend**: no toca backend, contratos HTTP ni base de datos.
> Se implementa con jest + `@testing-library/react-native`.

## Problema

El flujo de outfits ya era funcional (CRUD completo con el patrón controller-hook), pero:

1. **Los tabs no existían.** `RootNavigator` era un stack plano y `OutfitsList` **no era
   alcanzable** desde el armario más que por un link ad-hoc "Mis outfits ›" en el header. El
   diseño define una **barra de tabs inferior** (Armario · Outfits · Perfil) como mecanismo de
   navegación entre features.
2. Las pantallas de outfits (lista, detalle, builder) eran planas frente al diseño aprobado:
   tarjetas con miniaturas cuadradas + "+N" en vez de la **tira de miniaturas verticales 3/4**;
   detalle sin **hero** ni dot de color por prenda; builder con **bandeja clara** en vez de la
   **bandeja oscura `#082C38`** que es la firma visual del armado; estados de carga/vacío
   genéricos en vez de los del diseño (skeleton, ilustraciones, copy de marca).

## Referencia de diseño (pantallas 06–12 del canvas)

- **Tab bar** (todas): alto 82, fondo `rgba(255,255,255,.94)`, borde superior `#E4DCD3`,
  3 tabs con ícono dibujado (Armario = grilla 2×2, Outfits = 3 barras, Perfil = persona) +
  label 11px. Activo petróleo `#003B4A` (negrita), inactivo gris `#90989C`.
- **06 · Mis outfits:** eyebrow "Ready" (`#6F2B3E`) + título serif "Mis outfits" (42px), buscador
  "Buscar un outfit…" (sin toggle ni chips). Tarjeta: blanca, radio 20, borde `#EFE8E0`; tira de
  miniaturas 3/4 (una por prenda, ancho parejo); nombre serif 24; fila "N prendas" + chips de
  ocasión rellenos (`#DCE8EA`/`#003B4A`). FAB `+`.
- **07 · cargando:** 2–3 tarjetas skeleton (tiles `#ECE5DC`) + "Cargando tus outfits…".
- **08 · vacío:** ilustración de dos prendas en círculo `#DCE8EA`, título serif "Todavía no
  armaste outfits", subtítulo "Combiná prendas de tu armario y tené tus looks listos con
  antelación.", CTA "Armar mi primer outfit".
- **09 · detalle:** back circular; eyebrow "Outfit" + nombre serif 38 + "N prendas"; **hero
  strip** de miniaturas 3/4; sección "Prendas" (filas blancas: thumb 46×60, nombre + categoría,
  **dot de color** a la derecha); "Ocasiones" (chips rellenos) y "Tags" (chips con borde);
  barra de acción **"Editar" (ancho) + botón papelera** con borde `#B24A55` (archiva).
- **10 · builder:** top bar Cancelar / serif "Armar outfit" / spacer; input de nombre compacto
  `#F0EAE4`; chips de ocasión (seleccionado con ✓); **BANDEJA oscura `#082C38` "Tu outfit"**
  (eyebrow `#9FBFC6`, contador "N elegidas · mínimo 2", tiles oscuros con badge de orden
  `#DCE8EA`/`#003B4A` y quitar `#6F2B3E`, tile `+` punteado); buscador + chips de categoría;
  grilla 3-col (seleccionada = borde `#003B4A` + badge de orden); CTA "Guardar outfit".
- **11 · builder · armario vacío:** bandeja con tiles punteados + "Elegí prendas de abajo para
  empezar"; ilustración de percha + "Tu armario está vacío" + "Necesitás prendas para armar un
  outfit. Agregá algunas primero." + CTA "Ir a mi armario"; guardar deshabilitado.
- **12 · builder · sin resultados:** bandeja con lo elegido; buscador con texto + chips; estado
  "Sin resultados" + CTA "Limpiar filtros".

## Goals

- Montar el **`BottomTabNavigator`** (Armario · Outfits · Perfil) con íconos dibujados y estilos
  del diseño; anidarlo en el stack raíz (los detalles/altas/ediciones se apilan sobre los tabs).
- Rediseñar `OutfitsListScreen` + `OutfitCard`; agregar `OutfitCardSkeleton` (07) y
  `OutfitsEmptyState` (08).
- Rediseñar `OutfitDetailScreen` (09): hero strip, filas de prenda con dot de color, barra
  Editar + papelera.
- Rediseñar `OutfitForm` (10–12): bandeja oscura, grilla 3-col con selección numerada, estados
  builder vacío / sin resultados.
- Agregar pantalla **Perfil** (placeholder de marca; el canvas no la detalla).
- Tests jest que cubran los criterios de aceptación.

## Non-goals

- No se toca backend, contratos HTTP ni el modelo de datos.
- **Toggle de facetas Categoría/Ocasión:** el diseño lo muestra en armario (01) y builder (10),
  pero el armario **ya shippeado** aproximó a **chips de categoría** solamente. Por consistencia
  con lo shippeado, el builder mantiene chips de categoría (la faceta Ocasión queda como mejora
  posterior; el `occasionId` ya existe en `clothesApi`, así que es cableable después).
- **Google Fonts (Cormorant Garamond / Archivo):** se siguen aproximando con familia `serif`/
  system, igual que el armario (ver spec `rediseno-armario-mobile`, Q1). Cargarlas con
  `@expo-google-fonts` queda como mejora.
- **Perfil** es un placeholder; el login con Google sigue diferido (CLAUDE.md §1).
- No se agrega creación de tags desde el builder (el "+ Tag" del mockup queda fuera).
- No se muestra carrusel multi-foto: se usa la foto de portada por prenda.

## Módulos / servicios afectados

- `apps/mobile`:
  - `src/navigation/MainTabs.tsx` (**nuevo**), `src/navigation/TabBarIcon.tsx` (**nuevo**),
    `src/navigation/RootNavigator.tsx` (anida tabs), `src/navigation/types.ts` (tabs + props
    compuestas).
  - `src/features/profile/screens/ProfileScreen.tsx` (**nuevo**, placeholder).
  - `src/features/outfits/screens/OutfitsListScreen.tsx`, `OutfitDetailScreen.tsx` (rediseño).
  - `src/features/outfits/components/OutfitCard.tsx` (rediseño), `OutfitForm.tsx` (rediseño),
    `OutfitCardSkeleton.tsx` (**nuevo**), `OutfitsEmptyState.tsx` (**nuevo**).
  - `src/features/outfits/hooks/useOutfitsListController.ts` (tipo de navegación → tab).
  - `src/features/outfits/screens/AddOutfitScreen.tsx`, `EditOutfitScreen.tsx` ("Ir a mi armario").
  - `src/features/clothes/screens/ClothesListScreen.tsx` (props → tab; quita el link ad-hoc a
    outfits, ahora lo cubren los tabs).
- `apps/backend` — **ninguno**.
- Dependencia nueva: `@react-navigation/bottom-tabs`.

## Contratos afectados

Ninguno. Se consumen los endpoints/tipos ya existentes (`outfitsApi`, `clothesApi`, `Outfit`,
`ClothingItem`, catálogos). No cambia ningún shape HTTP/DB/tipo compartido.

## Impacto backend

Ninguno. Cambio puramente de presentación + navegación en `apps/mobile`.

## Impacto frontend

Se reemplaza el stack plano por **tabs + stack**: los tabs manejan la transición entre features
y los detalles/altas se apilan encima. Estado servidor sigue vía **TanStack Query**
(`useOutfits`, `useOutfit`, `useClothes`, catálogos). El patrón **controller-hook** se mantiene
(`useOutfitsListController`, `useOutfitDetailController`, `useOutfitForm`): las pantallas quedan
presentacionales.

## Impacto de base de datos

Ninguno.

## Edge cases

- Sin outfits → `OutfitsEmptyState` (08), no la lista.
- Cargando → skeleton (07), no spinner.
- Outfit con prenda sin foto/sin color → thumb placeholder / no se renderiza el dot.
- Builder con armario totalmente vacío → estado "Tu armario está vacío" + "Ir a mi armario" (11).
- Builder filtrando sin resultados → "Sin resultados" + "Limpiar filtros" (12), con la bandeja
  y el buscador aún visibles.
- Outfit con >5 prendas en la tarjeta → 4 miniaturas + tile "+N".
- Navegar a un detalle desde un tab lo apila sobre la barra de tabs (stack raíz).

## Criterios de aceptación

- [x] Hay una **barra de tabs** Armario · Outfits · Perfil; cambiar de tab cambia de feature.
- [x] **06** La lista renderiza una tarjeta por outfit con tira de miniaturas, nombre serif,
      "N prendas" y chips de ocasión; el FAB navega a `AddOutfit`; tocar una tarjeta navega a
      `OutfitDetail`.
- [x] **07/08** Cargando muestra skeleton; sin outfits muestra la ilustración + "Todavía no
      armaste outfits" + CTA que abre el alta.
- [x] **09** El detalle muestra hero, lista de prendas con dot de color, ocasiones y tags, back
      y barra "Editar" + papelera (que pide confirmación y archiva).
- [x] **10–12** El builder muestra la bandeja oscura "Tu outfit" con orden/quitar, grilla 3-col
      con selección numerada, y los estados vacío/sin-resultados; guardar exige ≥2 prendas.
- [x] `npm run typecheck` pasa y `npm test` (jest) pasa con los specs de estas pantallas.

## Plan de test

- **Unit / componentes (jest + @testing-library/react-native):**
  - `OutfitCard` — nombre/cantidad/ocasión, dispara `onPress`.
  - `OutfitsEmptyState` — título/subtítulo/CTA, dispara `onPressCreate`.
  - `OutfitsListScreen` — lista con datos + navega al detalle, empty state, FAB navega (mock del
    data hook).
  - `OutfitDetailScreen` — renderiza campos de un outfit mock; archivar pide confirmación y
    dispara la mutación.
  - `OutfitForm` — bandeja "Tu outfit" con mensaje vacío; tocar una prenda la agrega a la bandeja.
  - `useOutfitForm` — (ya existente) orden de selección, mínimo 2, filtros.
- **E2E:** manual en simulador/Expo; `npm run typecheck` + `npm test` en local.

## Rollout

- Feature flag: no aplica (MVP).
- Orden de despliegue: solo mobile; el backend no cambia. El deploy del backend se reejecuta
  desde la rama para verificar que sigue sano.
- Rollback: revertir el PR (cambio aislado a `apps/mobile`).

## Preguntas abiertas

- [x] Q: ¿3 tabs (con Perfil) o 2? **Decisión:** los que muestra el diseño → 3 (Armario ·
      Outfits · Perfil); Perfil es placeholder de marca.
- [x] Q: ¿Faceta Ocasión en el builder ahora? **Decisión:** no; se mantiene chips de categoría
      por consistencia con el armario shippeado (mejora posterior).
