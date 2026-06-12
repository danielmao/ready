# Documentación de Ready

Documentación modular del proyecto. El entregable principal es el
[README raíz](../README.md) (secciones 0–7); estos documentos son las expansiones.

| Doc | Contenido |
|-----|-----------|
| [01-PROJECT-OVERVIEW](01-PROJECT-OVERVIEW.md) | Problema, alcance MVP, roadmap, referencias |
| [02-ARCHITECTURE](02-ARCHITECTURE.md) | Arquitectura DDD por capas, ADRs, estructura de ficheros, límites entre dominios |
| [03-DATA-MODEL](03-DATA-MODEL.md) | ER, entidades, esquema Prisma, seeds |
| [04-API-SPECIFICATION](04-API-SPECIFICATION.md) | Endpoints, requests/responses |
| [05-FRONTEND-INTEGRATION](05-FRONTEND-INTEGRATION.md) | Pantallas, navegación, componentes |
| [06-USER-STORIES](06-USER-STORIES.md) | Historias de usuario con criterios |
| [07-WORK-TICKETS](07-WORK-TICKETS.md) | Backlog y tickets detallados |
| [08-INSTALLATION-GUIDE](08-INSTALLATION-GUIDE.md) | Setup local backend + mobile |
| [09-SECURITY-TESTING](09-SECURITY-TESTING.md) | Seguridad y estrategia de tests |

## Decisiones del MVP

| Tema | Decisión |
|------|----------|
| Planning | Un único "próximo outfit" activo (no calendario en v1) |
| Sugerencias | Fuera del MVP (roadmap Épica 2/3) |
| Auth | Diferida — single-user con `userId` fijo |
| Base de datos | PostgreSQL + Prisma |
| Backend | DDD por capas (`domain` / `application` / `infrastructure`); cruce entre dominios solo vía facade |
