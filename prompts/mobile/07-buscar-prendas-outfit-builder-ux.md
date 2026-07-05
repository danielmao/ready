---
category: mobile
source_raw: _inbox/20260705-023833-veo-que-al-crear-los-outfits.md
captured_at: 2026-07-05T02:38:33+00:00
status: curated
---

# Buscador de prendas en el outfit builder (definido por el UX agent)

**Intención.** Al crear un outfit no se podían **buscar** las prendas; con muchas prendas el
picker se vuelve incómodo. Pedido: usar el **UX agent** para definir bien esa pantalla.

**Contexto / decisión.** El `useOutfitForm` ya tenía estado `search` y filtraba la query, pero
la vista nunca renderizaba el input (búsqueda inaccesible). El Product UX Architect definió el
outfit builder: **buscador siempre visible** + **filtro por categoría** (`FilterChips`), una
**bandeja "Tu outfit"** fija con las prendas elegidas en orden y quitar rápido, resolución de
seleccionadas contra una caché (para que la bandeja no se vacíe al filtrar) y empty states
diferenciados (armario vacío vs sin resultados).

**Resultado.** `OutfitForm` reestructurado + `useOutfitForm` extendido (`categoryId`, `removeItem`,
`clearSearch`, `isFiltering`, `categoryOptions`); tests del hook + smoke HTTP del filtrado
(`GET /clothes?search=&categoryId=`). Documentado en `docs/specs/active/outfits-domain.md`
(sección "UX — Outfit builder"). Toda la lógica en el controller (patrón controller-hook, §5).
