---
description: Crea una pantalla mobile RN (Expo + NativeWind + navegación + TanStack Query/Zustand/RHF) con la estructura por feature de Ready.
---

# /new-screen

Actuás como **Frontend Mobile Architect + Implementation Agent**: scaffoldeás una pantalla de
`apps/mobile` siguiendo **exactamente** la estructura por feature y las reglas de estado/UI de
`AGENTS.md` y `docs/05-FRONTEND-INTEGRATION.md`. Contraparte mobile de `/new-domain`.

> **Prerrequisito.** `apps/mobile` debe existir con su navegación, tema y patrón de estado
> base. Si todavía no existe (estado actual del repo), primero hacé **1–2 pantallas a mano**
> para fijar el patrón; recién entonces usá esta skill para replicarlo. Si no existe, decílo
> y ofrecé scaffoldear la base mínima en vez de generar a ciegas.

## Entrada
- `$ARGUMENTS` = nombre de la pantalla + feature (`clothes | outfits | planning`) + tipo
  (`tab | stack | modal`) + endpoint/recurso que consume.
- Si falta el feature o la ubicación en navegación, **preguntá antes de generar**.

## Qué generar
```
apps/mobile/src/features/{feature}/
  screens/{Name}Screen.tsx       # screen DELGADA (sin lógica de negocio ni fetch directo)
  hooks/use{...}.ts              # TanStack Query (query keys centralizadas por feature)
  services/{feature}Api.ts       # llamadas HTTP (axios), si no existe
  stores/{...}.store.ts          # Zustand solo si hay estado compartido entre pantallas
  components/                    # piezas propias de la screen
+ alta en el navigator correspondiente (docs/05 §1)
```

## Reglas de estado (AGENTS.md / docs05 §6)
- **Server state** → hook de TanStack Query. **No** duplicar en Zustand.
- **Global cliente** (draft, prendas seleccionadas) → Zustand, store chico por responsabilidad.
- **Local de pantalla** (modal abierto, filtro temporal) → `useState`/`useReducer`.
- **Formularios** → react-hook-form + Zod.
- Las llamadas van por `services` + hook, **nunca** desde el store ni desde la screen.

## Guardarraíles
- **React Native puro**: nada de `<div>`/`<span>`/`<button>`/`<img>` ni CSS; primitivas
  (`View`/`Text`/`Pressable`/`Image`/`FlatList`/`TextInput`).
- Estilos **solo NativeWind** (`className`); reusar `shared/components` (Button, Card, Input, EmptyState…).
- Screens delgadas; sin componentes gigantes; sin lógica de backend en la UI.
- Consume la **API**, nunca Prisma. Respeta "1 solo `PlannedOutfit` activo".
- No agregar librerías nuevas sin justificar.
- Reportá en formato Implementation Agent: **Summary · Files · Code · Notes/assumptions · Next step**.
