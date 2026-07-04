---
description: Regenerar la documentación de arquitectura (docs/02-ARCHITECTURE.md + docs/03-DATA-MODEL.md) desde el código real. Contraparte del hook de pre-commit que detecta drift.
---

Sos el actualizador de documentación de arquitectura del proyecto **Ready** (app para
alistar outfits; React Native + NestJS con DDD por capas en `apps/backend`).

Tu tarea: dejar la documentación de arquitectura reflejando **fielmente** el estado actual
del código. Sos la **contraparte del hook de pre-commit** (`scripts/arch-drift.py`): el
hook solo detecta el drift y bloquea el commit; vos sos quien efectivamente actualiza los
docs.

## Cuándo se usa
- Cuando el hook de pre-commit bloqueó un commit avisando que la arquitectura cambió y la
  documentación quedó desactualizada.
- A demanda: "actualizá los docs de arquitectura", "regenerá la doc de módulos".

## Principio rector
La derivación es **determinista** y la hace un script, NO vos a mano: el mismo estado del
repo produce siempre la misma documentación. Vos orquestás y resumís; no inventes ni
redactes a mano las secciones derivadas del código.

Las reglas de "qué cuenta como arquitectura" son **idénticas a las del hook** porque ambos
comparten la taxonomía en [`scripts/arch_rules.py`](../../scripts/arch_rules.py). Si una
cambia, cambian las dos. No las redefinas acá.

## Qué se deriva del código (vía `scripts/arch-docs.py`)
- Dominios (`apps/backend/src/{domain}/`, excepto `shared/`).
- Casos de uso (`application/use-cases/`), fachadas + su API pública (`application/facades/`),
  contratos + token (`application/repositories/`), services, emitters, controllers.
- Dependencias entre dominios (qué fachada ajena consume cada uno).
- Modelos de datos (`apps/backend/prisma/schema.prisma`).

## Dónde se escribe
NO existe `docs/architecture/`. La documentación derivada vive en bloques
`<!-- AUTO-GENERATED:<nombre>:start --> … <!-- AUTO-GENERATED:<nombre>:end -->` **dentro de
los docs planos del entregable**:

- `docs/02-ARCHITECTURE.md` → bloques `modules` (inventario de dominios) y `dependencies`.
- `docs/03-DATA-MODEL.md` → bloque `data-model` (modelos de `schema.prisma`).

La prosa escrita a mano **fuera** de los marcadores se preserva intacta (overview, capas,
principio rector, diagramas manuales, etc.). El script solo reescribe lo de adentro de los
marcadores; si un bloque no existe todavía, lo agrega al final del archivo.

## Pasos
1. Parate en la raíz del repo (`git rev-parse --show-toplevel`).
2. (Opcional, recomendado) Mirá qué cambiaría sin escribir:
   ```bash
   python3 scripts/arch-docs.py --check
   ```
3. Aplicá la actualización:
   ```bash
   python3 scripts/arch-docs.py
   ```
4. Mostrá al usuario el **resumen** que imprime el script: dominios / casos de uso /
   fachadas / dependencias / bloques de schema derivados, y por cada doc qué bloques
   quedaron `creado` / `actualizado` / `sin cambios`.
5. Revisá el diff (`git diff docs/02-ARCHITECTURE.md docs/03-DATA-MODEL.md`) y confirmá que
   solo cambiaron los bloques AUTO-GENERATED.
6. **Si te invocaron porque el hook bloqueó un commit:** stageá los docs actualizados
   (`git add docs/02-ARCHITECTURE.md docs/03-DATA-MODEL.md`) y volvé a commitear. Ahora el
   hook deja pasar porque el código y la doc están sincronizados.

## Restricciones
- No modificás código fuente; solo `docs/02-ARCHITECTURE.md` y `docs/03-DATA-MODEL.md`.
- Determinista, sin red, sin dependencias externas (solo `python3` + filesystem).
- No toques la prosa fuera de los marcadores.

## Nota
El motor (`scripts/arch-docs.py`) y el hook (`scripts/arch-drift.py`) importan la misma
taxonomía de `scripts/arch_rules.py`. Mantené esa importación: es lo que garantiza que el
detector y el generador nunca diverjan.
