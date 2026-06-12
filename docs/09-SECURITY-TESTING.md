# 09 · Seguridad y testing

> Expansión de las secciones 2.5 y 2.6 del [README](../README.md).

## Seguridad

| Aspecto | MVP | Futuro (Épica 1) |
|---------|-----|------------------|
| Autenticación | `userId` fijo inyectado por guard `@CurrentUser` (single-user) | Google OAuth + JWT |
| Autorización | Scope implícito al único usuario | Filtrado por `userId` del token en cada repo/query |
| Validación de entrada | DTOs con `class-validator` en todos los endpoints | igual |
| Subida de imágenes | Validar tipo/tamaño; almacenar en `UPLOADS_DIR` | mover a bucket S3 + URLs firmadas |
| Errores | Filtro global de excepciones (no filtra stack al cliente) | igual |
| Secrets | Sólo `DATABASE_URL` en `.env` (no commiteado) | secret manager |

> **Nota de diseño:** todas las entidades llevan `userId` desde el MVP. Activar auth
> multi-usuario sólo cambia *cómo* se resuelve ese `userId` (del guard fijo al JWT), no
> el modelo ni los casos de uso.

## Estrategia de testing

### Backend

| Nivel | Qué se prueba | Herramienta |
|-------|---------------|-------------|
| Unit | Reglas de dominio: outfit con **≥2 prendas**, un solo `PlannedOutfit` activo, archivado lógico | Jest |
| Unit | Casos de uso y facades (orquestación) con repos mockeados | Jest + spies |
| e2e | Flujos HTTP: crear prenda → crear outfit → planear → confirmar | Jest + Supertest |

Reglas de test (alineadas con las prácticas del autor): mockear sólo lo que se usa,
preferir spies sobre stubs profundos, `jest.clearAllMocks()` en `afterEach`, 1–2
asserts por comportamiento. Detalle completo (mocking en `TestingModule`, formato/lint,
alcance): ver [`CODING-CONVENTIONS.md §4`](CODING-CONVENTIONS.md).

### Mobile

| Nivel | Qué se prueba | Herramienta |
|-------|---------------|-------------|
| Unit | Componentes clave (ClothesCard, OutfitPreview) y hooks de filtros | Jest + RN Testing Library |
| Integración | Render de pantallas con React Query mockeado | RN Testing Library |

### Casos de prueba críticos (invariantes)

1. Crear outfit con 1 prenda → `400`.
2. Quitar item dejando 1 prenda → bloqueado.
3. Fijar segundo `PlannedOutfit` → el primero queda `cancelled`.
4. `DELETE` de prenda → `isActive=false`, no desaparece de la DB.
5. Prenda duplicada en el mismo outfit → rechazada.
