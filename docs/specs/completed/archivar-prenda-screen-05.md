---
title: Pantalla 05 · Archivar prenda (diálogo de confirmación)
status: shipped
size_class: small
owner: @frontend-mobile
ticket: RDY-ARCHIVAR-05
created: 2026-07-04
last_updated: 2026-07-04
---

# Pantalla 05 · Archivar prenda (diálogo de confirmación)

- **Status:** shipped
- **Size class:** small
- **Owner:** @frontend-mobile
- **Ticket:** RDY-ARCHIVAR-05

> Reemplaza el archivado inmediato del detalle de prenda por el **diálogo de
> confirmación** del diseño Claude Design **05 · Archivar prenda**: modal centrado
> con backdrop oscuro, ícono en círculo, título serif "¿Archivar esta prenda?",
> cuerpo y botones apilados "Sí, archivar" (borgoña) / "Cancelar". Cambio solo
> frontend; reusa `useArchiveClothingItem`.

## Problema

El detalle (`02`) archivaba al toque de "Archivar", sin confirmación — un tap
accidental sacaba la prenda del armario. El diseño 05 define un diálogo de
confirmación previo, y no es la `Alert` nativa del sistema sino un modal propio
con la estética de la app.

## Goals

- Tocar "Archivar" en el detalle **abre el diálogo 05** en vez de archivar directo.
- **"Sí, archivar"** dispara `archive.mutate(id)` y vuelve al armario.
- **"Cancelar"** (o tocar el backdrop) cierra el diálogo sin efectos.
- Fiel al diseño: backdrop `primary-dark/50`, tarjeta `surface` radio 24, ícono
  `⌦` en círculo `secondary-soft`, título serif 26px, cuerpo `text-secondary`,
  botón confirmar `secondary` (borgoña) + cancelar con borde `border`.

## Non-goals

- Pantalla/listado de **archivo** para recuperar prendas (el copy la menciona;
  queda para una épica posterior — hoy el archivado sigue siendo lógico `isActive`).
- Reusar el diálogo en outfits u otros flujos (se deja el componente listo para ello).

## Solución

- **`shared/components/ConfirmDialog.tsx`** — diálogo de confirmación reutilizable
  (RN `Modal` transparente `fade`): props `visible`, `title`, `message`,
  `confirmLabel`, `onConfirm`, `onCancel`, `icon?`, `cancelLabel?`, `confirming?`.
  El backdrop cancela; un `Pressable` interno traga el tap sobre la tarjeta.
- **`ClothingDetailScreen`** — estado local `confirmArchive`; "Archivar" lo abre,
  `onConfirm` mutará + `goBack`, `onCancel` lo cierra. Se elimina la `Alert` nativa.

## Testing

- `ConfirmDialog` cubierto vía el detalle: abrir diálogo (no archiva directo),
  confirmar (`mutate(id)` + `goBack`), cancelar (sin efectos).
- `npx jest src/features/clothes/screens/ClothingDetailScreen` — verde.
