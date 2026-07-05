---
category: meta
source_raw: _inbox/20260705-023835-dame-un-prompt-para-claude-design.md
captured_at: 2026-07-05T02:38:35+00:00
status: curated
---

# Prompt para diseñar las pantallas de outfits (Claude design)

**Intención.** Obtener un **prompt reutilizable** para que Claude diseñe las pantallas de
outfits (lista, detalle y el builder de crear/editar), como punto de partida visual.

**Contexto / decisión.** Se generó un prompt autocontenido que incluye el **design system real**
de Ready (paleta petróleo/burgundy, tipografía serif de marca, estilo lookbook), las 3 pantallas
con sus requisitos de UX (incl. buscador + filtro + bandeja del builder) y pide la salida como
**Artifact HTML** de alta fidelidad. Se sugirió cerrar con "listá los tokens NativeWind por
componente" para tender el puente al código (la lógica ya está separada en controller-hooks, así
que un rediseño visual no toca la lógica).

**Resultado.** Prompt entregado en el chat (evidencia de uso de IA para acelerar el diseño de UI
manteniendo consistencia con el sistema de diseño existente).
