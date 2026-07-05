---
category: meta
source_raw: _inbox/20260705-023834-no-pares-hasta-terminar-tdd-loop.md
captured_at: 2026-07-05T02:38:34+00:00
status: curated
---

# Directiva de cierre: loop con TDD, pruebas HTTP y evidencia

**Intención.** Cerrar el feature de outfits de forma autónoma ("no pares hasta terminar"):
hacer **TDD** y **pruebas HTTP locales con el servidor prendido**, y si el puerto está ocupado,
**levantar en otro puerto** y probar igual. Recordatorio explícito de **documentar** y de
**guardar + curar** los prompts importantes.

**Contexto / decisión.** Se ejecutó como `/loop` en modo dinámico (self-paced), como tarea
finita hasta completarla. La selección de puerto quedó como patrón: 3000 → si está ocupado 3100
→ 3200.

**Resultado.** Specs backend completados (`jest src/outfits` 10/10); pruebas HTTP contra el server
local (cayó a :3100 cuando :3000 estaba ocupado); docs actualizadas; fix del hook `arch-drift.py`
(ignora `*.spec.ts/*.test.ts`); prompts guardados y curados. Buen ejemplo del patrón del proyecto:
verificación end-to-end + tooling + evidencia en cada entrega.
