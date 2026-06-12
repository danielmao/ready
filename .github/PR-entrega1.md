## Entrega 1 — Documentación técnica

Documentación completa del proyecto **Ready** (app para alistar/preparar outfits ·
React Native + NestJS), siguiendo el formato del proyecto final de AI4Devs.

> Esta rama parte de un baseline vacío en `main`, por lo que el diff del PR es **toda
> la entrega**.

### Qué se hizo

**1. Entregable principal — `README.md` (secciones 0–7)**
Ficha del proyecto · descripción del producto (objetivo, features, UX, instalación) ·
arquitectura · modelo de datos · especificación de la API · historias de usuario ·
tickets de trabajo · pull requests.

**2. Documentación modular — `docs/` (01–09 + convenciones)**
- `01-PROJECT-OVERVIEW` — problema, alcance MVP, roadmap, referencias.
- `02-ARCHITECTURE` — arquitectura DDD por capas, ADRs, estructura, límites entre dominios.
- `03-DATA-MODEL` — ER, entidades, esquema Prisma, seeds.
- `04-API-SPECIFICATION` — endpoints, requests/responses.
- `05-FRONTEND-INTEGRATION` — pantallas, navegación, componentes.
- `06-USER-STORIES` — historias con criterios de aceptación.
- `07-WORK-TICKETS` — backlog y ticket de ejemplo detallado.
- `08-INSTALLATION-GUIDE` — setup local backend + mobile.
- `09-SECURITY-TESTING` — seguridad y estrategia de tests.
- `CODING-CONVENTIONS` — reglas de código, logging y testing.

**3. Decisiones de alcance del MVP (cerradas con el usuario)**
- **Planning** = un único "próximo outfit" activo (no calendario en v1).
- **Sugerencias** clima/ocasión = fuera del MVP (roadmap Épica 2/3).
- **Auth** diferida — backend single-user con `userId` fijo (guard `@CurrentUser`).
- **Base de datos** = PostgreSQL + Prisma.
- Reglas de dominio: outfit ≥2 prendas · 1 `PlannedOutfit` activo · archivado lógico.

**4. Arquitectura backend (NestJS + DDD por capas)**
Por bounded context (`clothes`, `outfits`, `planning`, `users`) con capas
`domain` / `application` / `infrastructure` (regla `infra → application → domain`),
contratos con token de DI y cruce entre dominios **solo vía facade**. Los controllers y
DTOs son adaptadores de entrada (`infrastructure/http`).

**5. Evidencia de uso de IA — `prompts.md` + `prompts/`**
Prompts crudos preservados en `prompts/_inbox/` y versiones curadas/clasificadas en
`prompts/{meta,docs,backend}`. Sistema de captura/curación documentado.

**6. Tooling de arquitectura**
`dependency-cruiser` (enforcement de boundaries), hook de drift de la doc de
arquitectura, y skills (`new-domain`, `update-arch-docs`, `save-prompt`, `curate-prompts`).

### Estado
Documentación lista para revisión. El scaffolding de `apps/backend` y `apps/mobile` y la
implementación son fases posteriores.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
