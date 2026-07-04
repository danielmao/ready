---
category: meta
source_raw: _inbox/20260620-035702-anadir-spec-planner-para-escribir-specs.md
captured_at: 2026-06-20T03:57:02+00:00
status: curated
---

# Spec Planner + evaluación de OpenSpec

**Intención.** Sumar al `AGENTS.md` un rol **Spec Planner** que escriba los specs de features
(el "qué" y el alcance) antes de diseñar o codear, basándose en un sistema de specs interno ya
probado; y evaluar si conviene incorporar **OpenSpec** al proyecto.

**Contexto / decisión.** Se adoptó un enfoque de **spec-driven development liviano** (specs en
markdown, sin tooling): plantilla + carpetas `active/`/`completed/`, y hand-off
**Spec Planner → Architect (`## Technical design`) → Implementation Agent** (un PR por fila del
plan de ejecución). **OpenSpec se descartó para el MVP**: sumar una CLI/convención extra
contradice el principio "mantener simple"; queda como posible mejora futura.

> Nota: el prompt crudo citaba una fuente interna como referencia del sistema de specs; se
> **redactó** en la evidencia y en el proyecto a pedido del usuario (no nombrarla en Ready).

**Resultado.** `AGENTS.md`: rol 7 *Spec Planner* + lista de roles y *Regla de selección*
actualizadas. Nuevo scaffolding `docs/specs/` (`README.md`, `templates/feature-spec.md`,
`active/`, `completed/`). La plantilla se adaptó a single-repo (sin Kafka/cross-repo). Ver
[[04-contrato-roles-agents]] y [[../infra/02-devops-architect-y-technical-mentor]].
