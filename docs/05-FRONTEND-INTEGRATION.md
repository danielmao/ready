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

## 4. Estilos (NativeWind)

Los estilos se escriben con **NativeWind** (Tailwind CSS para React Native): clases
utilitarias en la prop `className` de los componentes, en vez de objetos `StyleSheet`.

- **Patrón:** componentes presentacionales estilizados con `className`; los tokens de
  diseño (colores, espaciado, tipografías) viven en `tailwind.config.js` y se reutilizan
  por nombre, sin valores mágicos repartidos por la UI.
- **Componentes base:** los de `common/` (Button, Input, Card, …) encapsulan las clases
  recurrentes para mantener consistencia y evitar duplicar utilitarios en cada pantalla.
- **Estado visual condicional:** se resuelve componiendo strings de `className` según
  props/estado (p. ej. variante de botón, item seleccionado en `ClothingItemSelector`).
- **Setup:** NativeWind se configura junto con el entorno (Expo o bare RN) —
  `tailwind.config.js`, el preset de Babel y los tipos de `className`. Detalle en
  [`08-INSTALLATION-GUIDE.md`](08-INSTALLATION-GUIDE.md).

> Convención: preferir clases de NativeWind sobre `StyleSheet.create`. Reservar estilos
> imperativos sólo para casos que las utilidades no cubran (animaciones, medidas calculadas).

### 4.1 Tema y paleta (design tokens)

Identidad **calmada, fashion-oriented**: base neutral cálida con acentos petróleo y burgundy.
Estos son los tokens canónicos; **toda la UI los usa por nombre** (nunca hex sueltos).

| Token | Hex | Uso |
|-------|-----|-----|
| `primary` | `#003B4A` | Acción principal, marca (azul petróleo). |
| `primaryDark` | `#082C38` | Estados pressed/active del primary; headers oscuros. |
| `primarySoft` | `#DCE8EA` | Fondos suaves, chips/badges del primary. |
| `secondary` | `#6F2B3E` | Acento secundario (burgundy): destacados, tags. |
| `secondaryDark` | `#4A1C2A` | Pressed/active del secondary. |
| `secondarySoft` | `#EAD6DC` | Fondos suaves del secondary. |
| `accent` | `#D9C9CC` | Detalles/realces (blush grisáceo). |
| `accentDark` | `#BCA9AE` | Variante de acento más contrastada. |
| `background` | `#F8F5F0` | Fondo de pantalla. |
| `surface` | `#FFFFFF` | Tarjetas, hojas, inputs. |
| `surfaceAlt` | `#F0EAE4` | Superficies secundarias / zebra. |
| `border` | `#D8D0C8` | Bordes y divisores. |
| `textPrimary` | `#172126` | Texto principal. |
| `textSecondary` | `#647177` | Texto secundario. |
| `textMuted` | `#90989C` | Texto deshabilitado/placeholder. |
| `textInverse` | `#FFFFFF` | Texto sobre fondos oscuros (primary/secondary). |
| `success` | `#6F8A63` | Estado de éxito. |
| `warning` | `#C3944A` | Advertencias. |
| `error` | `#B24A55` | Errores, acción destructiva. |
| `info` | `#004556` | Informativo. |

Se materializan como colores de NativeWind en `tailwind.config.js` (se usan como
`bg-primary`, `text-textSecondary`, `border-border`, etc.):

```js
// apps/mobile/tailwind.config.js — theme.extend.colors
module.exports = {
  content: ['./App.{js,jsx,ts,tsx}', './src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        primary: { DEFAULT: '#003B4A', dark: '#082C38', soft: '#DCE8EA' },
        secondary: { DEFAULT: '#6F2B3E', dark: '#4A1C2A', soft: '#EAD6DC' },
        accent: { DEFAULT: '#D9C9CC', dark: '#BCA9AE' },
        background: '#F8F5F0',
        surface: { DEFAULT: '#FFFFFF', alt: '#F0EAE4' },
        border: '#D8D0C8',
        text: {
          primary: '#172126',
          secondary: '#647177',
          muted: '#90989C',
          inverse: '#FFFFFF',
        },
        success: '#6F8A63',
        warning: '#C3944A',
        error: '#B24A55',
        info: '#004556',
      },
    },
  },
  plugins: [],
};
```

> Ejemplo de uso: `bg-primary text-text-inverse` (botón principal), `bg-surface border border-border`
> (tarjeta), `text-text-secondary` (subtítulos). El objeto `theme.colors` original (formato
> `primary/primaryDark/primarySoft`) puede vivir en `src/theme.ts` para acceso programático
> (gráficos, librerías que no leen `className`); la fuente de verdad de los hex es esta tabla.

## 5. Capa de servicios

`services/apiClient.ts` (axios + interceptores) y un `*Service.ts` por dominio
(`clothesService`, `outfitsService`, `planningService`) consumidos vía hooks de
TanStack Query. La división de responsabilidades de estado (qué va en Query, qué en
Zustand, qué en estado local) se detalla en [§6](#6-gestión-de-estado).

## 6. Gestión de estado

Enfoque **por capas**: **no** poner todo el estado en un store global. Cada dato vive en
la capa que le corresponde según su origen y su alcance.

> **Naming.** En este proyecto los dominios son `clothes` / `outfits` / `planning`
> (consistente con backend y navegación). Donde otras guías hablan de "wardrobe"/"ready",
> acá es `clothes`/`planning`.

### 6.1 Estado de servidor — TanStack Query

Todo dato que viene del backend se maneja con **TanStack Query**: prendas, listas y detalle
de outfits, outfit planeado, perfil de usuario y (a futuro) sugerencias de IA.

- **Queries** para leer; **mutations** para crear/actualizar/borrar.
- **No duplicar** datos de servidor en Zustand salvo que haya una razón clara.

```tsx
const { data, isLoading, error } = useClothingItems();
```

### 6.2 Estado global de cliente — Zustand

Zustand **solo** para estado de cliente que necesita compartirse **entre pantallas**:

- Draft del outfit en construcción (outfit builder) antes de guardarlo.
- Prendas seleccionadas mientras se arma un outfit.
- Preferencias de la app (tema) y estado de onboarding.
- Sesión de auth (cuando se implemente login).

No usar Zustand para cada lista o respuesta de API.

### 6.3 Estado local de pantalla — React

`useState` / `useReducer` para lo que pertenece a **una sola pantalla**:

- Modal abierto/cerrado, tab interna seleccionada.
- **Filtro temporal de una pantalla** (no se comparte → no va a Zustand).
- Loading de un botón cuando no corresponde a una mutation.
- Preview de imagen antes de subir.

### 6.4 Formularios — React Hook Form

`react-hook-form` (+ Zod) para formularios con validación o múltiples campos: alta de
prenda, alta de outfit, editar perfil, login (a futuro). Evitar gestionar formularios
grandes con muchos `useState` sueltos.

### 6.5 Regla principal

- Si el dato **viene del backend** → TanStack Query (no Zustand por defecto).
- Si es **temporal y compartido entre pantallas** → Zustand.
- Si **solo importa dentro de una pantalla** → estado local.

### 6.6 Estructura por feature

```txt
apps/mobile/src/
  app/
    providers/
      QueryProvider.tsx        # QueryClient + provider raíz
  features/
    clothes/
      hooks/                   # useClothingItems.ts, useCreateClothingItem.ts
      services/                # clothesApi.ts
      stores/                  # (si aplica) draft local del feature
    outfits/
      hooks/                   # useOutfits.ts, useCreateOutfit.ts
      services/                # outfitsApi.ts
      stores/                  # outfitBuilder.store.ts
    planning/
      hooks/                   # usePlannedOutfit.ts
      services/                # planningApi.ts
  shared/
    stores/                    # appPreferences.store.ts, auth.store.ts
```

### 6.7 Reglas de Zustand

- Stores **chicos por responsabilidad** (`outfitBuilder.store.ts`,
  `appPreferences.store.ts`, `auth.store.ts`), **no** un `app.store.ts` /
  `global.store.ts` que junte todo.
- Los stores **no llaman APIs directamente** salvo razón muy puntual: las llamadas van por
  los `*Api.ts`/services y los hooks de TanStack Query.

### 6.8 Reglas de TanStack Query

- Hooks de query **por feature** (`useClothingItems()`, `useCreateClothingItem()`,
  `useOutfits()`, `useCreateOutfit()`, `usePlannedOutfit()`). Evitar `useQuery` crudo dentro
  de pantallas grandes cuando la lógica puede encapsularse en un hook.
- **Query keys centralizadas por feature**:

  ```ts
  export const clothesQueryKeys = {
    all: ['clothes'] as const,
    lists: () => [...clothesQueryKeys.all, 'list'] as const,
    detail: (id: string) => [...clothesQueryKeys.all, 'detail', id] as const,
  };
  ```
