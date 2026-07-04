---
category: mobile
source_raw: _inbox/20260620-042303-define-el-tema-de-la-app-con-estos-colores.md
captured_at: 2026-06-20T04:23:03+00:00
status: curated
---

# Tema y paleta de la app (design tokens)

**Intención.** Definir la identidad visual de Ready a partir de una paleta concreta entregada
como `export const theme = { colors: {...} }`.

**Contexto / decisión.** Identidad **calmada, fashion-oriented**: base neutral cálida
(`background #F8F5F0`, `surface #FFFFFF`, `border #D8D0C8`) con acentos **petróleo** (`primary
#003B4A`) y **burgundy** (`secondary #6F2B3E`), más blush (`accent #D9C9CC`), escala de texto
(`textPrimary/Secondary/Muted/Inverse`) y estados (`success/warning/error/info`). Cada color
con sus variantes `Dark`/`Soft`.

**Resultado.** Se volcó como **design tokens canónicos** en `docs/05-FRONTEND-INTEGRATION.md
§4.1` (tabla token→hex→uso) + mapeo a NativeWind para `apps/mobile/tailwind.config.js`
(`theme.extend.colors`, agrupado `primary.{DEFAULT,dark,soft}`, `text.{...}`). Regla: usar los
tokens **por nombre** (`bg-primary`, `text-text-secondary`…), nunca hex sueltos; el `theme.ts`
plano queda para acceso programático. `AGENTS.md` (Reglas de UI) actualizado de "paleta neutral"
a la descripción real, apuntando a §4.1. Ver [[01-stack-mobile]] y [[02-state-management-por-capas]].
