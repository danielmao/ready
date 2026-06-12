# Prompts — evidencia de uso de IA (proyecto Ready)

Esta carpeta registra los prompts relevantes usados para construir **Ready**.
Es la evidencia del uso de IA exigida por el entregable AI4Devs, y la materia
prima del archivo `prompts.md` en la raíz del repo.

## Cómo funciona (grabado manual + curación on-demand)

Hay dos capas, a propósito. **La captura ya no es automática**: solo se guarda lo
que vos marcás como importante.

1. **Grabado manual (on-demand).**
   Ejecutás `/save-prompt` y se guarda **un** prompt importante, intacto, en `_inbox/`
   con timestamp y la marca `important: true`. Sin argumentos graba tu prompt anterior;
   con argumentos (`/save-prompt <texto>`) graba ese texto. No usa LLM, no juzga, no
   corrige: solo preserva la evidencia original.

2. **Curación on-demand.**
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

## Importante: alcance del comando

`/save-prompt` y `/curate-prompts` viven en `.claude/commands/` **del workspace**, así
que solo están disponibles cuando abrís Claude Code **desde esta carpeta**
(`/Users/daniel/projects/AI4devs/ready`). Trabajá este proyecto desde su propia raíz
para poder grabar y curar la evidencia.

> Antes la captura era automática (hook `UserPromptSubmit`). Se eliminó a propósito:
> ahora solo se graba lo que marcás con `/save-prompt`, para tener una traza curada y
> sin ruido.
