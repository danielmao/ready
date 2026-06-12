# Ready — contexto del proyecto

> Archivo de contexto durable. Cualquier sesión de Claude Code debe poder retomar el
> trabajo leyendo esto. Mantenerlo actualizado: idea, decisiones, estructura y estado.

## 1. Idea general de la app

**Ready** es una aplicación para **alistar/preparar tus outfits**: armar y dejar listas
combinaciones de ropa con antelación para no improvisar al vestirse. El usuario gestiona
un armario digital, crea outfits reutilizables, los planifica por día/calendario y recibe
sugerencias según clima u ocasión.

Es el **proyecto final de AI4Devs** (LIDR Academy). El **primer entregable es la
documentación** del proyecto, siguiendo el formato del repo de referencia (ver §5).

### Alcance del MVP (CERRADO — 2026-06-11)
- **Armario digital** — catálogo de prendas con foto, categoría, color, ocasiones, tags.
- **Crear/guardar outfits** — combinar ≥2 prendas en conjuntos reutilizables.
- **Planear el próximo outfit** — **1 solo `PlannedOutfit` activo** por usuario (NO calendario en v1).

Decisiones de alcance confirmadas con el usuario:

| Tema | Decisión MVP |
|------|--------------|
| Planning | Un único "próximo outfit" activo. Calendario por fecha = roadmap (Épica 2; `plannedFor` deja la puerta abierta). |
| Sugerencias clima/ocasión | **Fuera del MVP** (Épica 2/3). |
| Auth (Google) | **Diferida** — backend single-user con `userId` fijo vía guard `@CurrentUser`. |
| Base de datos | **PostgreSQL + Prisma**. |

## 2. Stack y decisiones confirmadas

| Tema | Decisión |
|------|----------|
| Frontend | **React Native** (`apps/mobile`) |
| Backend | **NestJS** (`apps/backend`) |
| Workspace | **Monorepo "apps/ simple"**: `apps/mobile` + `apps/backend`, un solo `CLAUDE.md` raíz, sin tooling extra de monorepo |
| Idioma de la documentación | **Español** (nombres de archivo en inglés, contenido en español, como el repo de referencia) |
| Estructura documental | **README único (secciones 0–7) + `docs/` modular numerado + `prompts.md`** |
| Cuenta de GitHub | **Personal** (`danielmao`, host SSH `github-dnl`). Repo: `git@github-dnl:danielmao/ready.git` |

## 3. Layout del workspace (objetivo)

```
ready/
├── CLAUDE.md                 # este archivo (contexto durable)
├── README.md                 # entregable AI4Devs (secciones 0–7) — POR CREAR
├── prompts.md                # evidencia de IA, curada — ver §4
├── .claude/                  # tooling de Claude Code (hooks, comandos) — ver §4
├── prompts/                  # captura + curación de prompts — ver §4
├── docs/                     # documentación modular numerada — POR CREAR (ver §5)
└── apps/
    ├── mobile/               # React Native — POR CREAR
    └── backend/              # NestJS — POR CREAR
```

## 4. Sistema de prompts (evidencia de uso de IA)

Modo **captura + curación on-demand** (ya construido y probado):

- **Captura** (automática, determinista): el hook `UserPromptSubmit`
  (`.claude/settings.json` → `.claude/hooks/capture-prompt.py`) guarda cada prompt
  **crudo e intacto** en `prompts/_inbox/`. Sin LLM, no bloquea, ignora comandos `/...`.
- **Curación** (on-demand): el comando **`/curate-prompts`** clasifica, corrige y
  enriquece los crudos en `prompts/{meta,docs,backend,mobile,infra,data-model}/` y
  actualiza `prompts.md`. **La evidencia cruda nunca se edita ni se borra.**
- Detalle completo: [`prompts/README.md`](prompts/README.md).

> ⚠️ El hook está en el `.claude/settings.json` **del workspace**: solo captura cuando
> Claude Code se abre **desde esta carpeta** (`/Users/daniel/projects/AI4devs/ready`).
> Trabajar Ready siempre desde su propia raíz.

## 5. Referencias de documentación

**Repo plantilla AI4Devs** (modelo a seguir):
`https://github.com/LIDR-academy/AI4Devs-finalproject-Example2`

- **README.md raíz** = entregable principal, con secciones numeradas:
  - `0.` Ficha del proyecto · `1.` Descripción general del producto (objetivo,
    características, UX, instalación) · `2.` Arquitectura del sistema (diagrama,
    componentes, estructura de ficheros, infra/despliegue, seguridad, tests) ·
    `3.` Modelo de datos (diagrama + entidades) · `4.` Especificación de la API
    (endpoints + esquemas OpenAPI) · `5.` Historias de usuario · `6.` Tickets de
    trabajo · `7.` Pull requests.
- **`docs/` modular numerado** (espejo a replicar para Ready):
  `01-PROJECT-OVERVIEW` · `02-ARCHITECTURE` · `03-DATA-MODEL` ·
  `04-API-SPECIFICATION` · `05-FRONTEND-INTEGRATION` · `06-USER-STORIES` ·
  `07-WORK-TICKETS` · `08-INSTALLATION-GUIDE` · `09-SECURITY-TESTING`.
- **`prompts.md`** = evidencia de los prompts usados (en Ready lo alimenta `/curate-prompts`).

> Nota: el repo de referencia es un chatbot RAG (FastAPI/Python). Para Ready se reusa su
> **estructura y formato de documentación**, NO su stack (Ready = RN + NestJS).

**Repo del proyecto** (vacío al inicio): `https://github.com/danielmao/ready`

## 6. Estado actual y próximos pasos

**Hecho:**
- ✅ Workspace clonado (cuenta personal) en `/Users/daniel/projects/AI4devs/ready`.
- ✅ Sistema de captura/curación de prompts construido y probado de punta a punta.
- ✅ Prompts fundacionales capturados en `prompts/_inbox/`.
- ✅ Este `CLAUDE.md` de contexto.
- ✅ **Alcance MVP cerrado** con el usuario (ver §1).
- ✅ **Entregable 1 (documentación) redactado**: `README.md` raíz (secciones 0–7) +
  `docs/` modular (01–09 + índice). Falta sólo `prompts.md` curado vía `/curate-prompts`.

**Siguiente:**
1. Curar prompts (`/curate-prompts`) para completar la evidencia de IA del entregable.
2. Scaffolding de `apps/backend` (NestJS + Prisma + Docker Postgres) y `apps/mobile` (RN).
3. Implementar módulos backend (clothes → outfits → planning) con tests.
