# Prompts — evidencia de uso de IA · Ready

Registro curado de los prompts más relevantes usados para construir **Ready**
(app para alistar outfits · React Native + NestJS). Los originales crudos viven en
[`prompts/_inbox/`](prompts/_inbox/); aquí queda la versión clasificada y pulida.
Ver [`prompts/README.md`](prompts/README.md) para el funcionamiento del sistema.

## meta

1. **Sistema de captura de prompts como evidencia de IA** —
   [detalle](prompts/meta/01-sistema-captura-prompts.md) ·
   [crudo](prompts/_inbox/20260612-025704-antes-de-empezar-quiero-hacer-unos-ajustes.md).
   Se define la carpeta `prompts/` y un hook `UserPromptSubmit` que captura cada
   prompt crudo; la clasificación/corrección/enriquecimiento se hace on-demand con
   `/curate-prompts`. Resultado: pipeline captura + curación funcionando.
   > Evolución posterior: el hook automático se **eliminó** y la captura pasó a ser
   > manual con `/save-prompt` (solo se graba lo marcado como importante).

2. **Kickoff del proyecto Ready** —
   [detalle](prompts/meta/02-kickoff-proyecto-ready.md) ·
   [crudo](prompts/_inbox/20260612-025931-vamos-a-crear-una-aplicacion-en-react.md).
   Se define **Ready** (app para alistar outfits), stack **React Native + NestJS** en
   un único workspace, y el **primer entregable = documentación** tomando el repo
   AI4Devs `AI4Devs-finalproject-Example2` como referencia de estructura/formato.
   Se pide persistir las referencias en un `CLAUDE.md` de contexto durable. Resultado:
   `CLAUDE.md` del workspace + decisiones de layout (monorepo "apps/ simple", doc en
   español, cuenta personal de GitHub).

## docs

1. **Estructura del proyecto y redacción del entregable 1** —
   [detalle](prompts/docs/01-estructura-y-entregable-1.md) ·
   [crudo](prompts/_inbox/20260612-041304-siguiendo-esta-estructura-de-proyecto-deseado.md).
   A partir de una especificación extensa (sitemap, modelo de datos DDD, navegación,
   APIs, referencias) se redacta el **entregable 1 = documentación** (README 0–7 +
   `docs/` 01–09). Antes de escribir se cierran 4 decisiones de alcance del MVP:
   planning = **1 outfit activo** (no calendario), **sin sugerencias** clima/ocasión,
   **auth diferida** (single-user), **PostgreSQL + Prisma**. Reglas: outfit ≥2 prendas,
   1 planned activo, archivado lógico.
   > ⚠️ Crudo **reconstruido**: este prompt no fue capturado por el hook porque la sesión
   > tenía como project root `le-projects` (no este workspace), así que el hook de Ready
   > no estaba activo. Se preservó la evidencia de forma manual.

## backend

1. **Arquitectura DDD por capas del backend** —
   [detalle](prompts/backend/01-arquitectura-ddd-por-capas.md) ·
   [crudo](prompts/_inbox/20260612-042626-voy-a-modificar-el-prompt-por-este.md).
   Encargo de "arquitecto de software": diseñar la estructura del backend (contratos,
   límites, wiring) **sin** lógica de negocio, con preguntas abiertas en vez de
   asunciones. Segunda versión de un prompt previo que asumía el stack de
   `ms-subscriptions` (TypeORM + Kafka), reescrita para el stack real de Ready
   (**Prisma + PostgreSQL**). Define las tres capas por bounded context
   (`domain` / `application` / `infrastructure`), la regla `infra → application → domain`,
   contratos con token de DI y cruce entre dominios **solo vía facade**. Resultado:
   `docs/02-ARCHITECTURE.md` (§1, §3, §3 bis) + README §2 reescritos según este patrón.

<!-- Próximas categorías (mobile, infra, data-model) se agregan al curar. -->

