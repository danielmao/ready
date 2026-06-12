# 05 · Frontend — pantallas y navegación

> Expansión de la sección 1.3 del [README](../README.md). Stack: React Native + React
> Navigation v6 + React Query + Zustand.

## 1. Navegación

```
RootNavigator
├── MainTabs (bottom tabs)
│   ├── Tab "Prendas"  → ClothesStack
│   │     ├── ClothesListScreen
│   │     └── ClothingDetailScreen
│   ├── Tab "Outfits"  → OutfitsStack
│   │     ├── OutfitsListScreen
│   │     └── OutfitDetailScreen
│   └── Tab "Planear"  → PlanningStack
│         ├── PlannedOutfitScreen
│         └── TodayOutfitPreviewScreen
├── SettingsStack (Settings, Profile, About)
├── SearchStack (SearchClothes, SearchOutfits)
└── ModalStack (CreateClothing, CreateOutfit, SelectOutfitForPlanning,
                GalleryUpload, ColorPicker)
```

| Tab | Pantalla raíz | Ícono |
|-----|---------------|-------|
| Prendas | ClothesListScreen | 👕 |
| Outfits | OutfitsListScreen | 👔 |
| Planear | PlannedOutfitScreen | 🗓️ |

## 2. Pantallas (propósito · datos · acciones)

### Tab Prendas

| Pantalla | Propósito | Consume | Modifica |
|----------|-----------|---------|----------|
| **ClothesListScreen** | Catálogo con filtros (categoría/color/ocasión) y búsqueda | `GET /clothes` | — |
| **ClothingDetailScreen** | Detalle + outfits relacionados | `GET /clothes/:id` | edita/archiva |
| **CreateClothingScreen** (modal) | Alta de prenda | catálogos | `POST /clothes` |

### Tab Outfits

| Pantalla | Propósito | Consume | Modifica |
|----------|-----------|---------|----------|
| **OutfitsListScreen** | Catálogo de outfits con filtros | `GET /outfits` | — |
| **OutfitDetailScreen** | Preview + items + botón "planear" | `GET /outfits/:id` | edita/archiva, add/remove item |
| **CreateOutfitScreen** (modal) | Alta de outfit (selector de prendas, ≥2) | `GET /clothes` | `POST /outfits` |

### Tab Planear

| Pantalla | Propósito | Consume | Modifica |
|----------|-----------|---------|----------|
| **PlannedOutfitScreen** | Outfit planeado activo; cambiar/confirmar | `GET /planning` | `PUT/DELETE /planning` |
| **TodayOutfitPreviewScreen** | Vista grande + checklist antes de salir | `GET /planning` | confirm |
| **SelectOutfitForPlanningScreen** (modal) | Elegir outfit a planear | `GET /outfits` | `POST /planning` |

## 3. Componentes reutilizables clave

- `common/`: Button, Input, Card, EmptyStateIndicator, LoadingIndicator.
- `clothes/`: ClothesCard, ImageGallery, ImageUploader, ClothesFilterPanel.
- `outfits/`: OutfitCard, OutfitPreview, OutfitItemsList, ClothingItemSelector.
- `planning/`: PlannedDateDisplay, OutfitChecklist, LargeOutfitPreview.
- `filters/`: CategorySelector, ColorPicker, TagSelector, OccasionSelector.

## 4. Capa de servicios

`services/apiClient.ts` (axios + interceptores) y un `*Service.ts` por dominio
(`clothesService`, `outfitsService`, `planningService`) consumidos vía hooks de React
Query. Estado de UI (filtros activos, visibilidad de modales) en Zustand.
