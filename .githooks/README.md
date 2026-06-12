# Git hooks versionados

Hooks del repo, versionados acá (no en `.git/hooks/`, que es local y no se commitea).

## Instalación (una sola vez por clon)

```bash
git config core.hooksPath .githooks
```

Esto le dice a git que use los hooks de esta carpeta. No requiere husky, lefthook ni
ninguna dependencia: solo `git` + `python3` (ya presentes en macOS/CI).

## `pre-commit` — detector de drift de arquitectura

Bloquea un commit cuando toca la **arquitectura** del backend (DDD por capas) pero **no**
actualiza la documentación de arquitectura en el mismo commit. No escribe docs: solo
detecta el desfasaje y te manda a correr la skill `update-arch-docs`.

La lógica vive en [`scripts/arch-drift.py`](../scripts/arch-drift.py), que es la **única
fuente de verdad** de las reglas (la comparte la skill `update-arch-docs`).

### Qué cuenta como cambio de arquitectura
- Crear/eliminar un dominio (`apps/backend/src/{domain}/.../{domain}.module.ts`).
- Agregar/renombrar/eliminar un caso de uso (`application/use-cases/`).
- Agregar/eliminar/renombrar una fachada, o cambiar su firma pública (`application/facades/`).
- Agregar/eliminar/renombrar un contrato de repositorio, o cambiar su firma/token (`application/repositories/`).
- Agregar/eliminar/renombrar un service, emitter o controller.
- Cambiar el wiring de un módulo: `providers`/`exports` en `{domain}.module.ts`.
- Cambiar el modelo de datos (`apps/backend/prisma/schema.prisma`).

Un cambio que solo toca el **cuerpo** de un método (sin alterar firmas, estructura ni
wiring) **no** cuenta.

### Mapeo a documentos
- Estructura / capas / wiring → `docs/02-ARCHITECTURE.md`
- Modelo de datos (`schema.prisma`) → `docs/03-DATA-MODEL.md`

## Modo check (CI / manual, no bloquea)

```bash
python3 scripts/arch-drift.py --check
```

Reporta los cambios de arquitectura detectados y si los docs están actualizados, y
**siempre** sale con código 0. Ideal para un step de CI informativo.
