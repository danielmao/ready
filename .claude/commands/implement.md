---
description: Implementa el código de un spec/fila del plan de ejecución (rol Implementation Agent): el cambio útil más pequeño, siguiendo la arquitectura y convenciones de Ready.
---

# /implement

Actuás como **Implementation Agent** (`AGENTS.md` §4): escribís el **código real** de una
feature a partir de su spec, una fila del plan de ejecución por vez (= 1 PR). Es el paso que
*rellena* lo que `/new-domain` y `/new-screen` dejaron scaffoldeado; no vuelve a generar
esqueletos.

> **Prerrequisito.** Debe existir el spec en `docs/specs/active/` (de `/write-spec`) y la
> estructura donde implementar (dominio scaffoldeado con `/new-domain` o feature/screen con
> `/new-screen`). Si falta el spec o la estructura, decílo y ofrecé el paso previo; no asumas.

## Entrada
- `$ARGUMENTS` = ruta/nombre del spec en `docs/specs/active/` **+** qué fila del **plan de
  ejecución** implementar (o el ticket `RDY-N`). Si hay varias filas, implementá **una**.
- Si falta el spec, listá los activos y preguntá. Si el alcance no está claro, **preguntá antes
  de codear**; no inventes comportamiento de producto.

## Pasos
1. Leé el spec: Goals, **Non-goals**, contratos afectados, criterios de aceptación y el
   `## Technical design` (la fila del plan a implementar).
2. **Inspeccioná la estructura existente** antes de tocar nada; seguí las convenciones del repo
   (no impongas estilos nuevos).
3. Implementá **el cambio útil más pequeño** que cubra esa fila:
   - **Backend** — llená `domain` (entidades/invariantes), `application` (use-cases con un solo
     `execute()`, services, facades, contratos) e `infrastructure` (controllers delgados, impl
     Prisma en `persistence`). Respetá `infra → application → domain`, cruce **solo vía facade**,
     Prisma confinado a `infrastructure/persistence`, DI por token.
   - **Mobile** — llená la lógica de screens/hooks/services/stores siguiendo las reglas de
     estado (TanStack Query / Zustand / local / RHF) y UI (RN puro + NativeWind). Screens delgadas.
4. Si aparece una **decisión de arquitectura nueva**, **documentala primero** (ADR en
   `docs/02-ARCHITECTURE.md §2`) antes de implementarla — no la tomes en silencio.
5. Corré el **DoD** (`CLAUDE.md §7`): `npm run lint:arch` + `npx jest src/{domain} --no-coverage`
   (solo el spec del cambio, no la suite entera). Si tocó arquitectura, regenerá doc con
   `/update-arch-docs`.
6. Actualizá el estado de la fila en el plan de ejecución del spec (`in-progress`/`open`).

## Salida — formato Implementation Agent
```
1. Summary
2. Files created or modified
3. Code
4. Notes / assumptions
5. Suggested next step
```
Incluí **rutas de archivo** e **imports completos** en cada bloque de código.

## Guardarraíles
- No refactorices archivos no relacionados. No introduzcas librerías nuevas sin justificar.
- No inventes features no solicitadas. No mezcles lógica de backend dentro de screens.
- No tomes decisiones de arquitectura/infra mayores sin documentarlas primero.
- Hand-off → `/e2e-local` (verificar) → `/review-spec` (evaluar vs spec + regresiones).
