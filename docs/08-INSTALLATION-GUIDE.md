# 08 · Guía de instalación

> Expansión de la sección 1.4 del [README](../README.md).

## Requisitos

- Node.js 20+
- Docker (para PostgreSQL local)
- Entorno React Native: Expo CLI **o** RN CLI (Xcode / Android Studio según target)

## Backend (`apps/backend`)

```bash
cd apps/backend
cp .env.example .env
docker compose up -d postgres      # Postgres en localhost:5432
npm install
npx prisma migrate dev             # aplica migraciones
npm run seed                       # catálogos + user fijo (single-user MVP)
npm run start:dev                  # API en http://localhost:3000
```

### Variables de entorno (`.env`)

| Variable | Ejemplo | Descripción |
|----------|---------|-------------|
| `DATABASE_URL` | `postgresql://ready:ready@localhost:5432/ready` | Conexión Prisma |
| `PORT` | `3000` | Puerto de la API |
| `UPLOADS_DIR` | `./uploads` | Carpeta de imágenes (MVP) |
| `DEFAULT_USER_ID` | `<uuid sembrado>` | Usuario único del MVP (lo usa `@CurrentUser`) |

## Mobile (`apps/mobile`)

```bash
cd apps/mobile
npm install
# apuntar la API:
echo "API_URL=http://localhost:3000/api" > .env
npm run start                      # Metro / Expo
```

> En dispositivo físico, reemplazar `localhost` por la IP de la máquina en `API_URL`.

### Setup de NativeWind (estilos)

Los estilos usan **NativeWind** (Tailwind para React Native). Se configura una vez al
scaffoldear `apps/mobile` (ver patrón de estilos en [`05-FRONTEND-INTEGRATION.md`](05-FRONTEND-INTEGRATION.md) §4):

```bash
cd apps/mobile
npm install nativewind
npm install -D tailwindcss
npx tailwindcss init                 # genera tailwind.config.js
```

1. **`tailwind.config.js`** — declarar el preset de NativeWind y las rutas a escanear:

   ```js
   module.exports = {
     content: ['./App.{js,jsx,ts,tsx}', './src/**/*.{js,jsx,ts,tsx}'],
     presets: [require('nativewind/preset')],
     theme: { extend: {} },   // tokens de diseño (colores, spacing, fuentes) acá
     plugins: [],
   };
   ```

2. **`babel.config.js`** — agregar el preset/plugin de NativeWind:

   ```js
   module.exports = function (api) {
     api.cache(true);
     return {
       presets: [
         ['babel-preset-expo', { jsxImportSource: 'nativewind' }],  // Expo
         'nativewind/babel',
       ],
     };
   };
   ```

   > En **bare React Native** (sin Expo), usar el preset `module:metro-react-native-babel-preset`
   > en lugar de `babel-preset-expo` y mantener `'nativewind/babel'`.

3. **`global.css`** — directivas de Tailwind, importadas desde el entrypoint (`App.tsx`):

   ```css
   @tailwind base;
   @tailwind components;
   @tailwind utilities;
   ```

4. **Tipos de `className`** — crear `nativewind-env.d.ts` con `/// <reference types="nativewind/types" />`
   para que TypeScript acepte la prop `className` en los componentes RN.

5. Reiniciar Metro limpiando caché tras la configuración: `npm run start -- --reset-cache`.

## Verificación rápida

```bash
curl http://localhost:3000/api/clothes/categories   # debe devolver el catálogo sembrado
```

## Troubleshooting

| Síntoma | Causa probable | Solución |
|---------|----------------|----------|
| `ECONNREFUSED` al migrar | Postgres no levantado | `docker compose up -d postgres` |
| Listados vacíos | Falta seed | `npm run seed` |
| App no conecta | `API_URL` apunta a `localhost` en device físico | usar IP de la máquina |
| `className` no aplica estilos | Falta el plugin de Babel o caché viejo de Metro | revisar `babel.config.js` y `npm run start -- --reset-cache` |
| TS marca error en `className` | Falta la referencia de tipos | crear `nativewind-env.d.ts` con `/// <reference types="nativewind/types" />` |
