---
category: mobile
source_raw: _inbox/20260620-034003-ten-en-cuenta-esto-mobile-app-react-native.md
captured_at: 2026-06-20T03:40:03+00:00
status: curated
---

# Stack móvil y precisión del backend

**Intención.** Fijar con precisión el stack móvil (más allá de "React Native") y reconfirmar
el del backend, para que la documentación y el código lo reflejen.

**Contexto / decisión.** Se definió el stack mobile:

- **React Native + TypeScript**.
- **Expo**, salvo que el proyecto ya use bare React Native (condicional, no decisión cerrada).
- **NativeWind** para estilos.
- Navegación con **React Navigation o Expo Router**, según el setup existente.

Y se reconfirmó el backend: **NestJS + TypeScript**, **estructura orientada a dominio**
(DDD por capas, ya establecida) y **REST API** en la primera versión.

**Resultado.** Stack volcado a `CLAUDE.md §2`, `AGENTS.md`, `README.md §2.2` y
`docs/02-ARCHITECTURE.md` (diagrama y tabla de recomendaciones: plataforma Expo, estilos
NativeWind, navegación dual). El detalle de estilos (NativeWind) se documentó en
`docs/05-FRONTEND-INTEGRATION.md` y su setup en `docs/08-INSTALLATION-GUIDE.md`.
