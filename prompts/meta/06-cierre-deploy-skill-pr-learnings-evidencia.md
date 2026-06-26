---
category: meta
source_raw: _inbox/20260626-045224-cierre-deploy-skill-pr-learnings-prompts.md
captured_at: 2026-06-26T04:52:24+00:00
status: curated
---

# Cierre del primer deploy: skill, PR, learnings y evidencia de prompts

**Intención.** Tras dejar el backend desplegado y verificado en AWS, consolidar el trabajo en
cuatro entregables: (1) crear la skill de cuentas AWS, (2) abrir el PR, (3) crear una carpeta
`learnings/` con un tutorial de "cómo hacer un primer deploy en AWS" a partir de lo vivido, y
(4) guardar y curar los prompts más relevantes de la conversación.

**Contexto / decisión.** Patrón de trabajo del proyecto: convertir un trabajo concreto en
**artefactos durables** — una skill reutilizable (en vez de repetir el procedimiento), un
tutorial didáctico en `learnings/` (distinto de `docs/`: documenta *cómo se aprendió*, con los
tropiezos reales), y la traza de prompts curada como evidencia de uso de IA del entregable AI4Devs.

**Resultado.**
- Skill global `aws-account` → ver [[../infra/04-dos-cuentas-aws-skill-y-secretos]].
- Carpeta `learnings/` con [`01-primer-deploy-aws.md`](../../learnings/01-primer-deploy-aws.md).
- Estos mismos prompts curados (este archivo + [[../infra/03-deploy-aws-prerequisitos]] +
  [[../infra/04-dos-cuentas-aws-skill-y-secretos]]) y volcados a `prompts.md`.
- PR de la rama `feat/backend-first-deploy-health`.
