---
category: mobile
source_raw: _inbox/20260706-004934-revisa-el-modal-de-armario-header.md
captured_at: 2026-07-06T00:49:34+00:00
status: curated
---

# Fidelidad de los headers de los modales (prenda y outfit)

**Intención.** Revisar al detalle los modales contra el diseño de Claude Design y corregir
los headers hasta dejarlos 1:1 con el mockup.

**Contexto / resultado (iteración de fidelidad).**
- **Modal de prenda:** el orden de campos estaba mal (Descripción al final) → se reordenó a
  `Foto → Nombre → Categoría → Color → Descripción → Ocasiones → Tags`, como el diseño 03/04.
- **Header de Editar prenda:** no pasaba `variant`, así que caía en el header de bottom-sheet
  (grabber + ✕) en vez del top-bar del diseño 03 → se pasó `variant="bar"`
  (Cancelar / título / Guardar). Luego se afinaron paddings (22px) y el divisor (`#E4DCD3`).
- **Headers de outfit:** se les dio el mismo `variant` que `ClothingItemForm`; finalmente se
  pidió que **editar sea igual a crear**, quedando ambos forms de outfit con el header
  **sheet** (grabber + ✕ + título serif centrado).

**Aprendizaje.** El "header" es un contrato visual con dos variantes (`sheet`/`bar`); las
pantallas deben elegir la variante explícitamente para no caer en el default. La verificación
se hizo contra la **fuente autoritativa** del diseño (DesignSync `get_file`), no de memoria.

Relacionado: [[08-diseno-outfits-y-tabs]], [[06-patron-controller-hook]].
