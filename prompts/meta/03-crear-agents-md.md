---
category: meta
source_raw: _inbox/20260620-034002-crea-el-agents-md-de-este-proyecto.md
captured_at: 2026-06-20T03:40:02+00:00
status: curated
---

# Crear el AGENTS.md del proyecto

**Intención.** Tener un `AGENTS.md` en la raíz: la versión **agent-agnóstica** del contexto
del proyecto, útil para cualquier agente de código (Claude Code, Cursor, Copilot, etc.),
complementaria al `CLAUDE.md`.

**Contexto / decisión.** Se creó `AGENTS.md` sin duplicar el `CLAUDE.md`: captura lo esencial
(qué es Ready, stack y layout reales, reglas de arquitectura DDD por capas, comandos de
enforcement `lint:arch`/drift, convenciones de testing, DoD y sistema de evidencia de IA) y
apunta a las fuentes detalladas (`CLAUDE.md`, `docs/02`, `docs/CODING-CONVENTIONS.md`) para no
desincronizarse. Se marcó explícitamente lo que **aún no existe** (`apps/backend`/`apps/mobile`
por crear).

**Resultado.** `AGENTS.md` inicial creado en la raíz (luego ampliado a un contrato de roles —
ver [[04-contrato-roles-agents]]).
