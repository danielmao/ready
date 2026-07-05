---
category: mobile
source_raw: _inbox/20260705-013819-veo-que-a-veces-sueles-poner.md
captured_at: 2026-07-05T01:38:19+00:00
status: curated
---

# Separar lógica de la vista: patrón controller-hook (definido por el arquitecto)

**Intención.** Las pantallas/formularios mobile mezclaban demasiada lógica (permisos,
mutaciones, RHF, estado, derivados) con el JSX. Pedido: separar con un **hook tipo
"view-controller"** para ordenar el código, **usando al arquitecto** para definir y establecer
la convención, y **documentarla**.

**Contexto / decisión.** El Frontend Mobile Architect definió el patrón **controller-hook**
(container/presenter): la lógica vive en `use<Screen>Controller` / `use<Entity>Form` (junto a
los data hooks, distinguidos por nombre), la vista queda presentacional; retorno agrupado
`{ state, actions, flags, data, form }`; umbral para no sobre-ingenierizar; tests del hook con
`renderHook` y de la vista con `render`.

**Resultado.** Documentado en `docs/CODING-CONVENTIONS.md §5` + dos ADRs en
`docs/02-ARCHITECTURE.md §2` + árbol mobile corregido. Establecido: refactor del caso testigo
`ClothingItemForm` → `useClothingItemForm`, y toda la feature `outfits` nace con el patrón
(`useOutfitForm`, `useOutfitsListController`, `useOutfitDetailController`).
