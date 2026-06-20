---
title: <Título de la feature>
status: draft
size_class: medium
owner: @<rol-o-persona>
ticket: <RDY-N>
created: <YYYY-MM-DD>
last_updated: <YYYY-MM-DD>
---

# <Título de la feature>

- **Status:** draft | in-review | approved | in-progress | shipped
- **Size class:** small | medium | large | risky
- **Owner:** @<rol-o-persona>
- **Ticket:** <RDY-N>
- **Created:** <YYYY-MM-DD>

> Plantilla de spec de Ready (enfoque de spec-driven development liviano en markdown),
> adaptada a un monorepo de un solo repo (sin Kafka/cross-repo). La escribe el
> **Spec Planner** (ver `AGENTS.md`). El `## Technical design` lo llena el Architect para specs
> medium/large/risky; se omite para `small`.

## Problema

<Un párrafo. Qué duele hoy. Concreto (fricción de usuario, gap de contrato, toil manual). Sin "deberíamos considerar".>

## Goals

- <Medible. "El usuario puede planear su próximo outfit en ≤2 taps" mejor que "mejorar UX".>
- ...

## Non-goals

- <Fuera de alcance explícito. Al menos uno (p. ej. "no incluye calendario por fecha").>
- ...

## Módulos / servicios afectados

- `apps/backend` — <dominio / ruta de archivo> (`clothes` | `outfits` | `planning` | `users`)
- `apps/mobile` — <feature / pantalla>

## Contratos afectados

| Tipo | Superficie | Cambio | ¿Rompe? | Consumidores |
|---|---|---|---|---|
| HTTP | `POST /api/…` | nuevo \| modificado \| eliminado | sí / no | `apps/mobile` (servicio X) |
| DB | `<tabla>.<columna>` | … | … | … |
| Tipo compartido | `<TypeName>` | … | … | … |

(Escribir "ninguno" + 1 línea de por qué si no cambia nada.)

## Impacto backend

<Un párrafo. Qué dominios/capas cambian (domain/application/infrastructure). Qué use-cases, facades o repositorios se agregan o modifican. Respetar `infra → application → domain` y cruce solo vía facade.>

## Impacto frontend

<Un párrafo. Qué pantallas/features cambian. Qué estado (TanStack Query / Zustand / local). Qué notará el usuario. O "ninguno — solo backend".>

## Impacto de base de datos

<¿Migración Prisma? ¿Columnas nuevas? ¿Índices? ¿Seed/backfill? O "ninguno".>

## Edge cases

- <Escenario concreto (p. ej. "crear outfit con <2 prendas → 400").>
- ...

## Criterios de aceptación

- [ ] <Testable. Un humano puede verificar pass/fail.>
- [ ] ...

## Plan de test

- **Unit:** <archivos/escenarios — dominio y use-cases>
- **E2E:** <flujos HTTP por módulo / componentes RN clave>

## Rollout

- ¿Feature flag? <nombre, default, owner — o "no aplica en MVP">
- ¿Orden de despliegue? <DB → backend → mobile>
- ¿Plan de rollback?

## Preguntas abiertas

- [ ] Q: <pregunta>. Owner: @<rol-o-persona>
- [ ] ...

---

## Technical design

> Lo llena el **Architect** (Frontend Mobile / Backend / DevOps) para specs medium/large/risky.
> Omitir para `small`.

### Resumen del enfoque

<Un párrafo. El diseño elegido y por qué.>

### Contratos cambiados (detalle)

<Tabla por contrato — shape viejo / shape nuevo / acción del consumidor.>

### Diagrama de secuencia

```mermaid
sequenceDiagram
  ...
```

### Plan de ejecución

> Una fila = un PR. Cada fila es un cambio acotado (rama `feat/RDY-N-...`).

| # | Fase | Área | PR (título propuesto) | Depende de | Estado |
|---|---|---|---|---|---|
| 1 | <…> | backend/mobile | `feat(...): ...` | — | not-started |
| 2 | <…> | … | … | #1 | not-started |

Estados: `not-started | in-progress | open | merged | blocked`.

### Riesgos

| Riesgo | Severidad | Mitigación |
|---|---|---|
| <…> | low/med/high | <…> |
