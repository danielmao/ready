---
category: mobile
source_raw: _inbox/20260706-004932-implementa-el-diseno-de-outfits.md
captured_at: 2026-07-06T00:49:32+00:00
status: curated
---

# Rediseño de las pantallas de outfits + tabs de navegación (fiel a Claude Design)

**Intención.** Desde la rama de entrega 2, sacar una rama nueva e implementar el diseño de
**outfits** del canvas Claude Design (`Ready.dc.html`), siendo **muy fiel** al mockup, e
incluir la **barra de tabs** (Armario · Outfits · Perfil) que el diseño define para la
transición entre pantallas. Usar el flujo de trabajo del proyecto (spec → TDD → review) y
lanzar un **agente de verificación de diseño** al terminar.

**Contexto / resultado.**
- El diseño no era accesible por WebFetch (403 en `claude.ai/design/p/…`): se obtuvo desde el
  link público `claudeusercontent.com`, desempaquetando el bundle standalone para leer las
  12 pantallas + el tab bar. Más tarde se confirmó contra la fuente autoritativa vía la
  herramienta de **DesignSync** (acceso al proyecto de Claude Design).
- Se montó el `BottomTabNavigator` (que no existía; `OutfitsList` ni era alcanzable), con
  íconos dibujados, anidado en el stack raíz.
- Se rediseñaron lista, tarjeta, skeleton, estado vacío, detalle (hero + dot de color) y el
  builder (bandeja oscura `#082C38`, grilla 3-col, estados vacío/sin-resultados).
- DoD: `typecheck` + `jest` verdes; spec en `docs/specs/active/rediseno-outfits-mobile.md`.
  El agente de verificación reportó **alta fidelidad**; sus 3 gaps menores se corrigieron.

Relacionado: [[08-prompt-para-disenar-pantallas-outfits]] (meta), [[07-buscar-prendas-outfit-builder-ux]].
