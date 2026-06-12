---
category: docs
source_raw: _inbox/20260612-041304-siguiendo-esta-estructura-de-proyecto-deseado.md
captured_at: 2026-06-12T04:13:04+00:00
status: curated
reconstructed: true
---

# Estructura del proyecto y redacción del entregable 1 (documentación)

**Intención.** Convertir una especificación de estructura ya pensada (sitemap, modelo
de datos DDD, navegación, funcionalidades, estructura de front/back, APIs y referencias)
en el **entregable 1 = documentación** de Ready, con formato AI4Devs (README secciones
0–7 + `docs/` modular). Construir el **MVP** dejando **puertas abiertas** a
funcionalidades futuras. Se pidió explícitamente preguntar antes de redactar si había
funcionalidades o temas por aclarar.

**Contexto / decisión.** El prompt traía una estructura muy completa pero con
ambigüedades y conflictos contra el `CLAUDE.md` ya confirmado. Antes de escribir se
plantearon 4 decisiones de alcance y el usuario resolvió:

| Tema | Decisión MVP |
|------|--------------|
| **Planning** | Un único **"próximo outfit" activo** por usuario (NO calendario). El campo `plannedFor` queda como punto de extensión hacia el calendario (Épica 2). |
| **Sugerencias clima/ocasión** | **Fuera del MVP** → roadmap (Épica 2/3). |
| **Auth (Google)** | **Diferida** → backend single-user con `userId` fijo (guard `@CurrentUser`); todas las entidades ya llevan `userId`. |
| **Base de datos** | **PostgreSQL + Prisma**. |

**Resultado.** Se redactó el entregable: `README.md` raíz (secciones 0–7) + `docs/`
modular (01–09 + índice). El modelo de datos se acotó al MVP (User, ClothingItem,
Category, Color, Tag, Occasion, Outfit, OutfitItem, PlannedOutfit) dejando
`OutfitHistory` y `OutfitRating` documentadas como futuras. Reglas de dominio clave:
outfit con **≥2 prendas**, **1 PlannedOutfit activo**, archivado lógico (`isActive`) en
lugar de borrado físico. Se actualizó el `CLAUDE.md` del workspace con el alcance cerrado.

## Prompt (versión resumida)

> Siguiendo esta estructura de proyecto deseada y las referencias que tenés, ayudame a
> armar la documentación para el entregable 1. Preguntame lo que necesites aclarar sobre
> funcionalidades o temas. La idea es construir el MVP, pero dejando abierto a más
> funcionalidades si alcanzamos.
>
> *(Adjunta una especificación extensa "Ready - Estructura del Proyecto": sitemap de 3
> tabs + stacks + modales, estructura por pantalla, modelo de datos DDD con
> agregados/entidades, navegación React Native, funcionalidades v1 vs futuras,
> estructura sugerida de frontend y backend, APIs REST iniciales y referencias de
> producto. Texto completo en el crudo reconstruido.)*
