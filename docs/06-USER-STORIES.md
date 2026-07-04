# 06 · Historias de usuario

> Expansión de la sección 5 del [README](../README.md). Formato: rol · objetivo · criterios
> de aceptación (AC).

## Core (MVP — imprescindible)

### HU-01 — Registrar una prenda
**Como** usuario **quiero** registrar una prenda con foto, categoría y color **para**
digitalizar mi armario.
**AC:**
- `name`, categoría y color son obligatorios; sin ellos no se guarda.
- Puedo adjuntar 0..N fotos.
- Al guardar, la prenda aparece en ClothesList y puedo abrir su detalle.

### HU-02 — Ver y filtrar mi armario
**Como** usuario **quiero** ver mis prendas y filtrarlas por categoría/color/ocasión
**para** encontrarlas rápido.
**AC:**
- Se listan sólo prendas activas (`isActive=true`).
- Los filtros se combinan (categoría + color + ocasión).
- Estado vacío con mensaje cuando no hay resultados.

### HU-03 — Crear un outfit
**Como** usuario **quiero** combinar ≥2 prendas en un outfit con nombre **para**
reutilizarlo.
**AC:**
- Mínimo 2 prendas; con menos, el guardado falla con mensaje claro.
- Una prenda no se repite dentro del mismo outfit.
- Al guardar, el outfit aparece en OutfitsList.

### HU-04 — Planear mi próximo outfit
**Como** usuario **quiero** fijar un outfit como "el próximo" **para** tenerlo listo.
**AC:**
- Sólo existe un planeado activo (`status=planned`).
- Al fijar otro, el anterior pasa a `cancelled` automáticamente.
- PlannedOutfitScreen muestra el outfit fijado.

### HU-05 — Revisar el outfit antes de salir
**Como** usuario **quiero** ver el outfit planeado con un checklist de prendas **para**
no olvidarme nada.
**AC:**
- TodayOutfitPreview muestra preview grande + lista de prendas.
- Puedo confirmar (el planeado pasa a `confirmed`).

## Importantes (MVP si alcanza el tiempo)

### HU-06 — Editar / archivar prendas y outfits
**AC:** edición de todos los campos; archivado lógico (no borra); las referencias
históricas no se rompen.

### HU-07 — Buscar prendas y outfits
**AC:** búsqueda por texto (nombre) combinable con filtros; resultados en SearchStack.

### HU-08 — Tags y ocasiones propias
**AC:** puedo crear tags nuevos y ocasiones (`isGlobal=false`) y reutilizarlos.

## Roadmap (NO en MVP)
- HU-R1 Calendario por fecha · HU-R2 Historial de uso · HU-R3 Calificación ·
  HU-R4 Sugerencias por ocasión/clima/IA · HU-R5 Login Google + sync.
