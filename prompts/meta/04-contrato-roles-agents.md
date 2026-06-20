---
category: meta
source_raw: _inbox/20260620-034005-mira-ayudame-a-anadir-esto-tambien-prompt-agents.md
captured_at: 2026-06-20T03:40:05+00:00
status: curated
---

# Contrato de roles en AGENTS.md (AI Engineering Architect)

**Intención.** Convertir el `AGENTS.md` en un **contrato de trabajo por roles** para agentes
de IA, de modo que no inventen features, no mezclen responsabilidades, mantengan arquitectura
limpia y ayuden a construir de forma incremental (y a aprender React Native).

**Contexto / decisión.** El prompt (extenso, estilo "AI Engineering Architect") pedía definir
5 roles —**Product UX Architect, Frontend Mobile Architect, Backend Architect, Implementation
Agent, React Native Mentor**—, cada uno con propósito / responsabilidades / qué no hacer /
cuándo se activa / reglas; más secciones de gestión de estado, reglas de UI (primitivas RN +
NativeWind), modelos mínimos, orden de prioridad (clothes→outfits→planning→…→login), *Role
Selection Rule* ("use the smallest role set needed") y *What Not To Do*.

**Coordinación (3 adaptaciones para no contradecir el repo).**

1. Naming `wardrobe`/`ready` → canónico **`clothes`/`outfits`/`planning`** (con nota de equivalencia).
2. **Estructura backend**: se descartó la versión simplificada del prompt y se usó la **DDD por
   capas ya existente** (`domain`/`application`/`infrastructure` + facades + repositories), que
   `dependency-cruiser` hace cumplir. El usuario confirmó explícitamente mantenerla
   (ver [[../backend/02-mantener-estructura-ddd-por-capas]]).
3. **Modelos mínimos**: alineados a `docs/03-DATA-MODEL.md` — `PlannedOutfit.status` =
   `planned|confirmed|cancelled` (no `used|skipped`); `categoryId`/`colorId` por catálogo.

**Resultado.** `AGENTS.md` reescrito como contrato de roles completo (roles, regla de selección,
gestión de estado, reglas de UI RN, modelos mínimos, What Not To Do, DoD, evidencia de IA).
Ver [[03-crear-agents-md]].
