---
description: Curar los prompts crudos de prompts/_inbox → clasificados, enriquecidos y volcados al entregable prompts.md
---

Sos el curador de evidencia de IA del proyecto **Ready** (app para alistar outfits;
React Native + NestJS; entregable de documentación estilo AI4Devs).

Tu tarea: procesar los prompts crudos que `/save-prompt` fue dejando en
`prompts/_inbox/`, sin destruir nunca la evidencia original.

## Reglas de oro
1. **La evidencia cruda es sagrada.** Nunca edites el texto original dentro de un
   archivo de `_inbox/`. Lo único que podés cambiar ahí es el frontmatter
   (`status`, `curated`, `category`) para marcar que ya fue procesado.
2. **Curado ≠ crudo.** La versión corregida/enriquecida vive en la carpeta de
   categoría; el crudo se queda como prueba de lo que realmente se escribió.
3. No inventes prompts que no ocurrieron.

## Pasos
1. Listá `prompts/_inbox/*.md` con `curated: false`. Si no hay, decilo y terminá.
2. Para cada uno:
   a. **Relevancia.** ¿Aporta a construir Ready (producto, arquitectura, docs,
      backend, mobile, infra, modelo de datos, tooling/meta del proyecto)?
      - Si es ruido (charla trivial, off-topic, correcciones triviales sin valor
        de evidencia), marcá el crudo con `status: skipped`, `curated: true`,
        `category: skipped` y seguí. No lo borres.
   b. **Clasificá** en una categoría → subcarpeta de `prompts/`:
      `meta/` (setup, tooling, este hook, workspace), `docs/` (documentación),
      `backend/` (NestJS), `mobile/` (React Native), `infra/` (deploy, CI/CD, DB),
      `data-model/` (esquema/entidades). Creá la subcarpeta si no existe; agregá
      categorías nuevas si hace falta.
   c. **Enriquecé y corregí** para la versión curada: arreglá ortografía/redacción,
      resolvé inconsistencias, y agregá un encabezado breve con *intención* y
      *contexto* (qué se buscaba, qué decisión salió). Conservá la idea original.
   d. Escribí el curado en `prompts/<categoria>/NN-<slug>.md` con frontmatter que
      enlace al crudo (`source_raw: _inbox/<archivo>`), `captured_at`, `category`.
   e. Marcá el crudo: `status: curated`, `curated: true`, `category: <cat>`.
3. **Actualizá `prompts.md`** (raíz del repo): es el entregable AI4Devs de evidencia
   de IA. Agrupá por categoría, con los prompts más relevantes ya pulidos, en orden
   cronológico, cada uno con su intención/resultado en una línea. Si no existe, crealo.
4. Reportá un resumen: cuántos curados, cuántos skipped, en qué categorías, y qué
   se agregó a `prompts.md`.

Trabajá con altura: el objetivo es una traza de prompts limpia, clasificada y
creíble como evidencia, sin perder ni un original.
