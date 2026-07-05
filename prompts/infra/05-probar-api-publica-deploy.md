---
category: infra
source_raw: _inbox/20260704-153719-probalo-apuntando-a-la-api-publica.md
captured_at: 2026-07-04T15:37:19+00:00
status: curated
---

# Verificar cambios contra la API pública desplegada

**Intención.** Tras un cambio, no conformarse con las pruebas locales: **probarlo apuntando a
la API pública** (el deploy en AWS) para confirmar que el código realmente corre en producción.

**Contexto / decisión.** Se adoptó como práctica de cierre verificar el health y los endpoints
del feature contra la URL pública (`https://<eip>.nip.io/api/...`) además del e2e local.

**Resultado.** Patrón de verificación en dos niveles: e2e local (Postgres docker) + smoke HTTP
contra el deploy. Aplicado al cerrar `outfits` (GET/POST verificados live tras el `ready-deploy`).
