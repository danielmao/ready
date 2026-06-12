# 01 · Visión general del producto

> Expansión de la sección 1 del [README](../README.md).

## 1. Problema y propuesta de valor

Vestirse a las apuras genera fricción: prendas que no se encuentran, combinaciones que
no convencen, tiempo perdido. **Ready** convierte el ropero en un catálogo digital y
permite **dejar listo el outfit de la próxima salida con antelación**.

La promesa central está en el nombre: estar **Ready** (listo). El MVP se enfoca en el
acto de *alistar*, no en comprar ropa ni en recomendaciones automáticas.

## 2. Usuario objetivo

- Persona que quiere organizar su ropa y reducir la decisión diaria.
- **Uso personal**: el MVP es single-user por dispositivo (sin login).

## 3. Alcance del MVP

### Incluido (core)

- Armario digital: alta, listado, filtros, detalle, edición y archivado de prendas.
- Outfits: creación (≥2 prendas), listado, detalle, edición, archivado.
- Planning: fijar **un** próximo outfit, verlo con checklist, cambiarlo, confirmarlo.

### Incluido si alcanza el tiempo (importante, no bloqueante)

- Búsqueda avanzada de prendas/outfits.
- Tags dinámicos y ocasiones propias.
- Múltiples fotos por prenda.
- Filtros combinados.

### Excluido del MVP — roadmap

| Funcionalidad | Épica | Punto de extensión ya previsto |
|---------------|-------|--------------------------------|
| Calendario por fecha (semana/mes) | 2 | `PlannedOutfit.plannedFor` (fecha opcional) |
| Historial de uso | 2 | entidad `OutfitHistory` documentada |
| Calificación de outfits | 2 | entidad `OutfitRating` documentada |
| Recordatorios/notificaciones | 2 | `plannedFor` + push |
| Sugerencias por ocasión | 2 | filtros por `occasionId` ya existen |
| Sugerencias con IA / clima | 3 | servicio externo desacoplado |
| Login Google / multi-usuario / sync | 1 (post-MVP) | `userId` ya presente en todas las entidades; guard reemplazable |

## 4. Principios de diseño

1. **Simplicidad primero** — 3 tabs, flujos cortos, sin sobrecarga de features.
2. **Puertas abiertas sin deuda** — el modelo soporta las extensiones del roadmap sin
   migraciones disruptivas.
3. **Archivado lógico** — nada se borra físicamente (`isActive`), para no romper
   referencias históricas.

## 5. Referencias de producto analizadas

| App | Qué tomar | Qué evitar |
|-----|-----------|------------|
| Stylely | Catálogo visual, filtros por color/categoría/ocasión | UI sobrecargada, paywall del core |
| Cladwell | Minimalismo, foco en combinaciones | Modelo pay-per-outfit |
| Whooz | Montaje visual del outfit, historial | Exceso de features de shopping |
| Cladwell / Google Calendar | Planeación por fecha (roadmap) | Complejidad de calendario completo |

A evitar como categoría: apps de retail (Shein/Zara/ASOS) — son de compra, no de
organización; y apps con el core detrás de paywall.
