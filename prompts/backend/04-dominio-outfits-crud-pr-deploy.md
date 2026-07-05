---
category: backend
source_raw: _inbox/20260705-013820-hacer-que-se-puedan-crear-modificar.md
captured_at: 2026-07-05T01:38:20+00:00
status: curated
---

# Dominio outfits: crear/modificar/eliminar + PR + deploy

**Intención.** Implementar el **segundo dominio del MVP** (`clothes → outfits → planning`):
poder crear, modificar y eliminar outfits (conjuntos reutilizables de ≥2 prendas), abrir el PR
y desplegar la rama.

**Contexto / decisión.** Se ejecutó el flujo completo de Ready: `/write-spec` → `/new-domain`
→ implementación → `/e2e-local` → `/new-screen` (mobile) → `/review-spec` → PR → deploy. El
dominio consume `ClothesFacade` (validación de prendas/catálogos) y expone `OutfitsFacade` para
`planning`. Sin migración (tablas ya existían). Se resolvió el wiring cross-dominio con módulos
`@Global` para respetar `cross-domain-only-via-facade`.

**Resultado.** Backend DDD con CRUD + tests + e2e (local y en producción) verdes; UI mobile con
el patrón controller-hook; docs de arquitectura y API sincronizadas. PR #9 sobre
`feature-entrega2-dmtu`, desplegado desde `feat/outfits-domain`. Spec:
`docs/specs/active/outfits-domain.md`.
