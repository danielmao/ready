---
category: mobile
source_raw: _inbox/20260630-115801-como-corro-la-app-y-veo-el-resultado.md
captured_at: 2026-06-30T11:58:01+00:00
status: curated
---

# Correr la app mobile y verla funcionando (→ upgrade a Expo SDK 54)

**Intención.** Levantar la app de `apps/mobile` y ver el feature de armario funcionando en un
dispositivo real.

**Contexto / inconvenientes resueltos (saga de "que corra").** El simple "cómo la corro"
destapó una cadena de incompatibilidades de la base mobile, resueltas de raíz:
- **Metro `TerminalReporter` / `EMFILE`:** NativeWind 4.2.6 (resuelto desde `^4.1.23`) arrastraba
  RN 0.86 → reanimated 4 → worklets → metro 0.84 sobre el 0.80 esperado; y el watcher de Metro
  chocaba con el límite de file descriptors de macOS → se instaló **Watchman**.
- **Decisión clave:** el Expo Go de las stores es **SDK 54** y no corre proyectos SDK 51 en
  dispositivos físicos, y el simulador iOS de la máquina no tenía runtime instalado (~7 GB). Se
  optó por **subir el proyecto a Expo SDK 54** (RN 0.81 / React 19): desbloquea correr en el
  teléfono real sin descargas y alinea NativeWind 4.2 con su RN objetivo.
- **Migración SDK 54:** React Navigation 6→7, reanimated 4 + `react-native-worklets`,
  `babel-preset-expo` explícito, `react-native-css-interop` hoisteado (jsxImportSource nativewind),
  `@tanstack/react-query` de vuelta a `^5.59` (con TS 5.9 ya no hay bug de inferencia). Verificado
  con `tsc --noEmit` y `expo export` (bundle OK).
- **Conexión device → backend:** `localhost` desde el teléfono apunta al teléfono; hay que usar
  `EXPO_PUBLIC_API_URL=http://<IP-LAN>:3000/api` (o el deploy público de AWS) y relanzar con
  `--clear` porque la variable se "hornea" en el bundle.

**Resultado.** App corriendo en el teléfono real listando las prendas; aprendizajes de stack
mobile (versionado Expo, watchman, localhost vs LAN) documentados en `08-INSTALLATION-GUIDE.md`.
