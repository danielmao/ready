# Prompts — evidencia de uso de IA (proyecto Ready)

Esta carpeta registra los prompts relevantes usados para construir **Ready**.
Es la evidencia del uso de IA exigida por el entregable AI4Devs, y la materia
prima del archivo `prompts.md` en la raíz del repo.

## Cómo funciona (captura + curación on-demand)

Hay dos capas, a propósito:

1. **Captura cruda (automática, determinista).**
   El hook `UserPromptSubmit` (ver `.claude/settings.json` →
   `.claude/hooks/capture-prompt.py`) guarda **cada** prompt que enviás,
   intacto, en `_inbox/` con timestamp y `session_id`. No usa LLM, no juzga,
   no corrige: solo preserva la evidencia original. Ignora comandos puros
   (los que empiezan con `/`) y prompts vacíos.

2. **Curación on-demand (yo, cuando lo pidas).**
   Ejecutás `/curate-prompts` y reviso el `_inbox/`: descarto lo irrelevante,
   corrijo redacción/inconsistencias, enriquezco con intención y contexto, y
   clasifico cada prompt en su subcarpeta. Luego actualizo `prompts.md`.

> **La evidencia cruda nunca se edita ni se borra.** La versión pulida vive en
> las subcarpetas; el original queda en `_inbox/` como prueba.

## Estructura

```
prompts/
├── README.md          # este archivo
├── _inbox/            # prompts CRUDOS = evidencia intacta (no editar el cuerpo)
├── meta/              # setup, tooling, este sistema de hooks, workspace
├── docs/              # documentación del proyecto
├── backend/           # NestJS
├── mobile/            # React Native
├── infra/             # deploy, CI/CD, base de datos
└── data-model/        # esquema / entidades
```
(las subcarpetas se crean al curar, según haga falta.)

## Importante: alcance del hook

El hook está en `.claude/settings.json` **del workspace**, así que solo dispara
cuando abrís Claude Code **desde esta carpeta** (`/Users/daniel/projects/AI4devs/ready`).
Para que los prompts de Ready se capturen, trabajá este proyecto desde su propia raíz.
