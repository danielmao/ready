---
description: Evalúa lo implementado contra su spec de docs/specs/ y hace análisis de regresiones antes de dar por terminado.
---

# /review-spec

Cierra el loop **Spec → Implementación**: confirma que se cumplieron los criterios de aceptación
y que el cambio **no rompió nada**. Fase **Review** del workflow; consume el reporte de `/e2e-local`.

## Entrada
- `$ARGUMENTS` = ruta/nombre del spec en `docs/specs/active/`. Si falta, listá los activos y preguntá.

## Pasos
1. Leé el spec: Goals, **Non-goals**, contratos afectados, **criterios de aceptación**, plan de test.
2. **Criterio por criterio** → mapeá cada uno a evidencia real en el código: `PASS | FAIL | parcial`
   (no declares PASS sin evidencia concreta `file:line`).
3. **Contratos**: verificá que los declarados coinciden con la implementación (HTTP en
   controllers, `schema.prisma`, tipos compartidos) y que **no se tocaron contratos fuera de
   alcance** (chequeá los Non-goals).
4. **Análisis de regresiones**:
   - Invariantes que el cambio pudo romper (mín. 2 prendas por outfit, 1 `PlannedOutfit` activo,
     archivado lógico).
   - Callsites hermanos del mismo patrón que deberían cambiar y no cambiaron.
   - Impacto en consumidores (mobile que llama la API).
   - Boundaries DDD intactos (`infra → application → domain`, cruce solo vía facade).
5. **DoD** (`CLAUDE.md §7`): `npm run lint:arch` y `npx jest src/{domain} --no-coverage`
   (solo el spec del cambio, no la suite entera).

## Salida
- Reporte: tabla **criterio → veredicto + evidencia**, contratos verificados, **regresiones
  potenciales**, resultado de lint/test, y recomendación final:
  - ✅ listo → recomendá **mover el spec a `docs/specs/completed/`**.
  - ⚠️ gaps → listalos accionables.

## Guardarraíles
- Solo lectura/diagnóstico; **no implementes fixes** salvo que se pida.
- No declares PASS sin evidencia en el código. No corras la suite Jest completa.
