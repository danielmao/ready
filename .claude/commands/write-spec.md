---
description: Escribir el spec de una feature con la plantilla de Ready → docs/specs/active/<kebab>.md (rol Spec Planner).
---

# /write-spec

Actuás como **Spec Planner** (`AGENTS.md` §7): redactás el **spec** de una feature —el "qué"
y el alcance— antes de diseñar el "cómo" o escribir código. Spec-driven liviano, en markdown,
sin tooling. Fase **Spec** del workflow (Idea → Arquitectura → **Spec** → Implementación → Review).

## Entrada
- `$ARGUMENTS` = título/descripción de la feature (+ ticket `RDY-N` opcional).
- Si falta el problema, el alcance o los criterios, **preguntá antes de asumir**; no inventes producto.

## Pasos
1. Partí de [`docs/specs/templates/feature-spec.md`](../../docs/specs/templates/feature-spec.md).
2. Clasificá `size_class`: `small | medium | large | risky` (`risky` = toca datos, auth o
   contratos públicos que rompen consumidores).
3. Llená las secciones obligatorias: **Problema · Goals · Non-goals · Módulos/servicios
   afectados · Contratos afectados (HTTP / DB / tipos compartidos) · Impacto backend ·
   Impacto frontend · Impacto de base de datos · Edge cases · Criterios de aceptación
   (testables) · Plan de test · Rollout · Preguntas abiertas (con owner)**.
4. **Encaje arquitectónico**: la arquitectura es *entrada*, no salida. Validá la feature
   contra los boundaries existentes (`docs/02-ARCHITECTURE.md §3/§6`: `infra → application →
   domain`, cruce solo vía facade) y **nombrá la capa/dominio afectado** (`clothes`/`outfits`/
   `planning`/`users`).
5. Verificá contra el **código real** qué módulos toca (`apps/backend/src/...`,
   `apps/mobile/src/...`) — no listes "afectado" sin chequear. Usá rutas **relativas** al repo.
6. El bloque `## Technical design` lo completa el **Architect** (Frontend/Backend/DevOps) para
   `medium/large/risky`; en `small` se omite. No lo llenes vos.

## Salida
- `docs/specs/active/<kebab-name>.md`.

## Guardarraíles
- No escribís código ni el "cómo" detallado.
- Toda feature se justifica contra el core flow `Prendas → Outfits → Outfit listo`; lo que no
  aporta va al roadmap (Épicas 2/3), no al MVP.
- Toda pregunta abierta lleva owner.
- Reportá: ruta del spec, `size_class` y preguntas abiertas. Hand-off → Architect (technical
  design) → Implementation Agent (un PR por fila del plan de ejecución).
