---
category: meta
source_raw: _inbox/20260706-004935-guardado-prompts-merge-docs-apagar.md
captured_at: 2026-07-06T00:49:35+00:00
status: curated
---

# Cierre de la sesión: guardar prompts, mergear a entrega 2, verificar docs y apagar el server

**Intención.** Rutina de cierre del trabajo de outfits: (1) guardar/curar los prompts de la
sesión, (2) **mergear el PR a la rama de entrega 2** (`feature-entrega2-dmtu`), (3) verificar
que la documentación esté actualizada, y (4) **apagar el servidor** de AWS para no dejar la
instancia corriendo.

**Contexto / resultado.** El PR #10 (`feat/rediseno-outfits-mobile`) tenía base
`feature-entrega2-dmtu`. Cierre operado con las skills del proyecto: `/save-prompt` +
`/curate-prompts` para la evidencia, `gh` (cuenta personal `danielmao`) para el merge, y la
skill `ready-deploy` (`stop`) para apagar la instancia EC2. Buen hábito de cierre para el MVP:
no dejar infraestructura encendida entre sesiones.

Relacionado: [[06-cierre-deploy-skill-pr-learnings-evidencia]], [[07-loop-tdd-pruebas-http-cierre]].
