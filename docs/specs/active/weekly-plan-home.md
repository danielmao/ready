---
title: Plan semanal como home — un outfit para cada día de la semana
status: shipped
size_class: medium
owner: @backend-architect
ticket: no aplica (sin tickets en el MVP)
created: 2026-08-23
last_updated: 2026-08-23
---

# Plan semanal como home — un outfit para cada día de la semana

- **Status:** shipped (backend + mobile; `jest src/planning` + `lint:arch` + e2e HTTP 43/43 verdes 2026-08-23)
- **Size class:** medium (cambia el invariante del dominio `planning` y sus contratos HTTP, con
  migración de backfill + índice; no toca `clothes`, `outfits` ni `auth`)
- **Owner:** @backend-architect
- **Ticket:** no aplica (sin tickets en el MVP)
- **Created:** 2026-08-23

> Evoluciona el último dominio del MVP. No agrega tablas: reusa el `plannedFor` que el modelo
> ya reservaba como punto de extensión al calendario.

## Problema

El MVP dejaba fijar **un solo "próximo outfit"** por usuario: planear el martes borraba el
lunes. Eso resuelve "qué me pongo mañana", pero no el problema real del producto —*alistar la
ropa con antelación*—, que es un ejercicio semanal: el domingo uno quiere dejar resuelta la
semana entera. Además el tab **Planear** era el tercero de cuatro, cuando es lo primero que el
usuario quiere ver al abrir la app.

## Goals

- El usuario puede elegir **un outfit para cada día** de la semana (lunes→domingo); los días
  son independientes entre sí y entre semanas.
- El plan de la semana es el **home**: primera tab y pantalla de entrada tras el login.
- Se puede **navegar** a la semana anterior/siguiente y volver a la actual.
- Cambiar el outfit de un día reemplaza **sólo ese día**; liberar un día no toca el resto.
- Confirmar (HU-05) queda acotado al día: el checklist es el del día seleccionado.
- Un endpoint que devuelva la semana entera de una vez (`GET /api/planning/week`), con los
  **7 días siempre presentes** — los libres en `null` — para que la vista no invente huecos.
- `npm run lint:arch` pasa; spec de cada use-case con lógica; e2e HTTP del flujo semanal.

## Non-goals

- **No** calendario completo (rangos arbitrarios, vista mensual, recurrencias) — Épica 2.
- **No** outfits recurrentes ("todos los lunes lo mismo").
- **No** notificaciones ni recordatorios por día.
- **No** sugerencias por clima/ocasión — Épicas 2/3.
- **No** historial (`OutfitHistory`): confirmar sigue siendo sólo un cambio de `status`.
- **No** tablas nuevas: se reusa `planned_outfits` con `plannedFor` ya existente.

## Decisiones

| Tema | Decisión | Por qué |
|---|---|---|
| Semántica del "día" | **Fecha real** (`YYYY-MM-DD`), no un día de la semana abstracto | Un `plannedFor` con fecha es la puerta ya abierta al calendario de la Épica 2; los "lunes recurrentes" serían un modelo distinto y más pobre. |
| Huso horario | La API guarda **medianoche UTC**; el **cliente** calcula el día con su fecha local y lo manda explícito | Un día es una clave, no un instante. Si el servidor asumiera "hoy", en husos negativos se correría de día a la noche. El default UTC del backend queda sólo como atajo para curl. |
| Inicio de semana | **Lunes** (ISO-8601) | Es como se lee un plan semanal en es-AR; el backend normaliza cualquier `start` al lunes, así el cliente no tiene que hacerlo bien. |
| Invariante | Un activo por **(usuario, día)**, sostenido cancelando el del mismo día dentro de la transacción de `create` | Igual mecanismo que el MVP (no hay índice único parcial en Prisma), pero con el filtro acotado al día. |
| `PUT /api/planning` (update) | **Eliminado** | Con un día por clave, `POST` ya reemplaza el outfit de ese día. Dos endpoints para lo mismo era la deuda del modelo viejo. |
| `DELETE` | Pasa a `DELETE /api/planning/:day` | El día es parte de la identidad del recurso, no un filtro opcional. |

## Módulos / servicios afectados

- `apps/backend/src/planning/` — reescrito: `domain/week.ts` (helpers puros de fecha),
  contrato de repositorio por día, `PlanHydrationService`, `GetWeekPlanUseCase` /
  `GetDayPlanUseCase` (reemplazan a `GetPlannedOutfitUseCase`), `UpdatePlannedOutfitUseCase`
  eliminado.
- `apps/backend/prisma/` — migración `20260823120000_planning_by_day` (backfill + índice).
- `apps/mobile/src/features/planning/` — `WeekPlanScreen` + `WeekStrip` +
  `useWeekPlanController` (reemplazan `PlannedOutfitScreen`/`usePlannedOutfitController`).
- `apps/mobile/src/shared/utils/week.ts` — **nuevo**: fechas en hora local del dispositivo.
- `apps/mobile/src/navigation/` — `PlanearTab` → `HomeTab`, movido al **primer** lugar;
  `PlanPicker` pasa a recibir `{ day }`.
- **Sin cambios** en `clothes`, `outfits`, `users`, `auth` ni en el guard `@CurrentUser`.

## Contratos afectados

| Tipo | Superficie | Cambio | ¿Rompe? | Consumidores |
|---|---|---|---|---|
| HTTP | `GET /api/planning/week?start=` | nuevo | no | `apps/mobile` |
| HTTP | `GET /api/planning` | **cambia**: devuelve `DayPlanView` de un día (query `day`) en vez del único activo | sí | `apps/mobile` (actualizado en el mismo cambio) |
| HTTP | `POST /api/planning` | **cambia**: `day` pasa a ser obligatorio; `plannedFor` desaparece del body | sí | `apps/mobile` |
| HTTP | `PUT /api/planning/confirm` | **cambia**: pasa a requerir body `{ day }` | sí | `apps/mobile` |
| HTTP | `DELETE /api/planning` | **reemplazado** por `DELETE /api/planning/:day` | sí | `apps/mobile` |
| HTTP | `PUT /api/planning` | **eliminado** | sí | ninguno (no lo usaba el mobile) |
| Facade interna | `OutfitsFacade.findActiveOutfitById` | consumido igual que antes | no | `planning` |
| DB | `planned_outfits` | backfill de `plannedFor` + índice `(userId, plannedFor)` | no | backend |

> Los cortes son aceptables: el único consumidor es la app, que se actualiza en el mismo
> cambio, y el MVP no tiene clientes externos.

## Impacto backend

`planning` mantiene `infra → application → domain` y sigue siendo **dominio terminal** (no
expone facade):

- **domain**: `week.ts` con las reglas de fecha (parseo estricto de `YYYY-MM-DD` —rechaza
  `2026-02-31`—, `startOfWeek` al lunes, `weekDays`). Puras: sin Nest ni Prisma. `PlannedOutfit`
  no cambia de forma; sólo su documentación de invariante.
- **application**: el contrato pasa de `findActive(userId)` a `findActiveByDay(userId, day)` +
  `findActiveBetween(userId, from, to)`, y de `cancelActive` a `cancelDay`.
  **`PlanHydrationService`** concentra la composición día↔outfit que antes estaba inline en el
  use-case, porque ahora la comparten el día y la semana; **deduplica por `outfitId`**, así un
  mismo outfit repetido en la semana se pide una vez a la facade y no siete.
- **infrastructure**: el controller pasa a `/week` + operaciones por día;
  `PrismaPlannedOutfitRepository.create` acota su `updateMany` de cancelación al `plannedFor`
  pedido — ese filtro **es** el cambio de invariante.

## Impacto frontend

`WeekPlanScreen` es el nuevo home. Arriba, una **tira de 7 días** (`WeekStrip`) que muestra por
día su miniatura si tiene outfit, un hueco punteado si está libre, un ✓ si está confirmado y un
punto si es hoy. Debajo, el día seleccionado: outfit + checklist + confirmar/cambiar/liberar, o
el estado vacío con "Elegir outfit". Flechas ‹ / › cambian de semana conservando el día de la
semana; el rango es un botón que vuelve a hoy.

El controller (`useWeekPlanController`) deriva `weekStart` del día seleccionado —un solo estado
en vez de dos que se pueden desincronizar— y congela `today` al montar para que la selección no
salte sola si la app queda abierta cruzando la medianoche.

`shared/utils/week.ts` hace las cuentas en **hora local**: `toDayKey` arma la clave a mano en
vez de usar `toISOString()`, que pasaría por UTC y devolvería el día equivocado de noche.

## Impacto de base de datos

Migración `20260823120000_planning_by_day`, sin DDL de tablas:

1. **Backfill**: las filas activas del modelo viejo no tenían día → se anclan a hoy (UTC), así
   siguen visibles en la semana en curso en vez de quedar invisibles. Las canceladas son
   historia y se dejan como están.
2. **Desempate**: si un usuario tuviera más de un activo sin día (el modelo viejo sólo lo impedía
   por código), el backfill los pondría en el mismo día; se conserva el más reciente y el resto
   pasa a `cancelled`.
3. **Índice** `(userId, plannedFor)` para el acceso dominante: la semana de un usuario.

## Edge cases

- `POST /api/planning` sin `day` → `400`; con `19/08/2026` o `2026-02-31` → `400`.
- `POST` con outfit inexistente/archivado/ajeno → `404` (nada se persiste).
- `POST` sobre un día que ya tenía outfit → reemplaza **ese** día; el resto de la semana intacto.
- `PUT /api/planning/confirm` sobre un día libre → `404`.
- `DELETE /api/planning/:day` sobre un día ya libre → `404` (idempotente a nivel fila, explícito
  a nivel HTTP).
- `GET /api/planning/week?start=nope` → `400`; `start` a mitad de semana → se normaliza al lunes.
- Semana sin nada planeado → 7 días con `plannedOutfit: null` (no un array vacío).
- **Día huérfano**: se archiva un outfit que estaba planeado → el día conserva su
  `plannedOutfit` pero viaja con `outfit: null` e `items: []`; la app lo detecta
  (`flags.isOrphan`) y ofrece re-elegir en vez de romper.
- Mismo outfit planeado varios días → válido; la facade se consulta una sola vez.
- Semana que cruza fin de mes/año → cubierto por los helpers (`addDays` sobre epoch).
- Usuario en UTC-3 planeando a las 23:00 → el día es el suyo, no el del servidor.

## Criterios de aceptación

- [x] `GET /api/planning/week?start=<jueves>` → `200` con `weekStart` = lunes, `weekEnd` =
      domingo y exactamente 7 días.
- [x] `POST /api/planning {outfitId, day}` → `201` con el `DayPlanView` del día, outfit
      hidratado y sus prendas.
- [x] Dos días distintos planeados conviven; el día del medio sigue libre.
- [x] Re-postear un día cambia sólo ese día; los demás quedan igual.
- [x] `PUT /api/planning/confirm {day}` deja ese día en `confirmed` y los otros en `planned`.
- [x] `DELETE /api/planning/:day` libera sólo ese día; repetirlo → `404`.
- [x] Semanas distintas son independientes.
- [x] Validaciones: `day` ausente/mal formado/inexistente → `400`; outfit inexistente → `404`.
- [x] Día huérfano: `plannedOutfit` presente con `outfit: null`.
- [x] Mobile: Home es la primera tab y la pantalla de entrada; la tira permite elegir día;
      el picker planea el día que trajo la ruta.
- [x] `npx jest src/planning` + `npm run lint:arch` + `npx jest` (mobile) + `tsc --noEmit` verdes.

## Verificación

```bash
# backend
cd apps/backend && npx jest src/planning --no-coverage && npm run lint:arch
# e2e HTTP (con el stack local levantado — ver docs/08-INSTALLATION-GUIDE.md)
./e2e/weekly-plan.e2e.sh
# mobile
cd apps/mobile && npx tsc --noEmit && npx jest --no-coverage
```

Resultado 2026-08-23: `jest src/planning` 19/19 · `lint:arch` sin violaciones ·
`e2e/weekly-plan.e2e.sh` **43/43 PASS** (dos corridas seguidas, es idempotente) ·
mobile `tsc` limpio y `jest` 72/72.

## Preguntas abiertas

- **¿Cuánto atrás/adelante puede navegar el usuario?** Hoy no hay tope: se puede planear
  cualquier semana. Si aparece ruido (planes a 2027), acotar a ±N semanas en el controller.
- **¿Qué pasa con los días que ya pasaron?** Hoy se muestran igual y se pueden editar. Con
  `OutfitHistory` (Épica 2) el pasado debería volverse de sólo lectura.
- **Recurrencia** ("todos los lunes, este outfit") — Épica 2; requiere un modelo aparte, no
  más filas en `planned_outfits`.
