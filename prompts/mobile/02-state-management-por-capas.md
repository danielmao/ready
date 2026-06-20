---
category: mobile
source_raw: _inbox/20260620-034004-vamos-a-usar-sus-state-management.md
captured_at: 2026-06-20T03:40:04+00:00
status: curated
---

# Gestión de estado por capas (TanStack Query / Zustand / local / RHF)

**Intención.** Adoptar un enfoque de **state management por capas** para el frontend, sin
poner todo en un store global.

**Contexto / decisión.** Cuatro capas según origen y alcance del dato:

- **TanStack Query** — todo dato del backend (prendas, outfits, planned, perfil, sugerencias IA futuras); queries para leer, mutations para escribir.
- **Zustand** — estado global de cliente compartido entre pantallas (draft de outfit, prendas seleccionadas, preferencias, onboarding, auth futuro); stores chicos por responsabilidad, sin `app.store.ts` gigante, sin llamar APIs directo.
- **Estado local** (`useState`/`useReducer`) — lo de una sola pantalla (modales, **filtros temporales**, previews).
- **react-hook-form** — formularios con validación.

Regla principal: *si el dato viene del backend, no va a Zustand por defecto → TanStack Query*.
Hooks por feature (`useClothingItems`, `useOutfits`, `usePlannedOutfit`) y query keys
centralizadas por feature.

**Coordinación.** El prompt usaba el naming `wardrobe`/`ready`; se mapeó al canónico del repo
**`clothes`/`outfits`/`planning`**. Además resolvió una contradicción previa: los filtros de
una sola pantalla pasaron de "Zustand" a **estado local**.

**Resultado.** Nueva sección **§6 Gestión de estado** en `docs/05-FRONTEND-INTEGRATION.md`;
tabla de estado actualizada en `docs/02-ARCHITECTURE.md` (servidor/global/local) y árbol
`apps/mobile/src/` con `app/providers/`, `features/*/stores` y `shared/stores/`. Resumen en
`AGENTS.md`. Ver [[01-stack-mobile]].
