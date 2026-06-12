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

<!-- Próximas categorías (backend, mobile, infra, data-model) se agregan al curar. -->
