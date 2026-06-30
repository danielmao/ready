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
docker compose -f compose.dev.yaml up -d postgres   # Postgres en localhost:5433
npm install
npx prisma generate                # genera el cliente Prisma
npx prisma migrate dev             # aplica migraciones
npm run seed                       # catálogos + user fijo (single-user MVP)
npm run start:dev                  # API en http://localhost:3000
```

> El puerto host es **5433** (no 5432) para no chocar con otros Postgres locales. Atajos en
> `package.json`: `npm run db:up` / `db:down` (Postgres dev), `migrate:dev`, `seed`.

### Variables de entorno (`.env`)

| Variable | Ejemplo | Descripción |
|----------|---------|-------------|
| `DATABASE_URL` | `postgresql://ready:ready@localhost:5433/ready?schema=public` | Conexión Prisma |
| `PORT` | `3000` | Puerto de la API |
| `NODE_ENV` | `development` | `development` activa pino-pretty |
| `MVP_USER_ID` | `<uuid sembrado>` | Usuario único del MVP; debe coincidir con el seed y el guard `@CurrentUser` |

## Mobile (`apps/mobile`)

```bash
cd apps/mobile
npm install
npm run typecheck                  # valida que los contratos del backend tipan
# apuntar la API (opcional; default por plataforma: ios/web=localhost, android=10.0.2.2):
export EXPO_PUBLIC_API_URL=http://localhost:3000/api
npm run start                      # Metro / Expo
```

> La base URL se resuelve en `src/config/env.ts` desde `EXPO_PUBLIC_API_URL`. En dispositivo
> físico, exportá la **IP LAN** de tu máquina, p. ej. `EXPO_PUBLIC_API_URL=http://192.168.0.10:3000/api`.
>
> **SDK:** el proyecto usa **Expo SDK 54** (RN 0.81 / React 19), compatible con el Expo Go más
> reciente de la App Store/Play Store. En **macOS instalá Watchman** (`brew install watchman`)
> antes de `expo start` para evitar `EMFILE: too many open files` (límite de file descriptors).

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

## Deploy a AWS (EC2 + Docker)

Deploy del backend al MVP en AWS — **manual y reproducible**, sin CI/CD. **Ejecutado**: el
dominio `clothes` corre en producción con base de datos (ver "Servicios desplegados").

1. **Provisión** (una vez): Security Group (80/443 público, 22 solo a tu IP), instancia EC2
   `t3.micro` con `apps/backend/deploy/bootstrap.sh` como *user data*, y una **Elastic IP**.
2. **Deploy**: vía la skill `ready-deploy` (`.claude/skills/ready-deploy/run.sh deploy <rama>`):
   prende la instancia, hace checkout+pull de la rama y `docker compose up -d` (build). Verifica
   `https://$DOMAIN/api/health`. La skill verifica la identidad AWS (cuenta personal) antes de actuar.

### Servicios desplegados (un solo EC2, Docker Compose)

| Servicio | Imagen | Rol | Expuesto |
|----------|--------|-----|----------|
| `caddy` | `caddy:2-alpine` | Reverse-proxy, termina HTTPS (Let's Encrypt) y proxya a `api:3000` | 80/443 al mundo |
| `api` | build de `apps/backend/Dockerfile` (NestJS) | API REST; al arrancar corre `prisma migrate deploy` + seed (ver `docker-entrypoint.sh`) | sólo red interna de compose |
| `postgres` | `postgres:16-alpine` | Base de datos (volumen `ready_pgdata`) | sólo red interna (sin puerto al host) |

> **DB en el mismo EC2** (no RDS) por costo/simplicidad del MVP; Postgres no se expone a
> internet (sólo lo ve `api`). Migrar a RDS + backups es la iteración siguiente cuando el
> core crezca. ADR registrado en [`02-ARCHITECTURE.md`](02-ARCHITECTURE.md) §2.

Comandos AWS CLI completos y el plan DevOps en
[`../apps/backend/deploy/README.md`](../apps/backend/deploy/README.md).

> ⚠️ Recursos AWS que cuestan dinero. La instancia se **apaga** cuando no se usa
> (`ready-deploy stop`) y se prende para demos (`ready-deploy start`); la Elastic IP mantiene
> la URL estable entre apagados.

### Variables de entorno de deploy (`apps/backend/.env` en el host)

El deploy reescribe este `.env` con sólo `DOMAIN`; el resto toma defaults del `compose.yaml`.

| Variable | Ejemplo | Descripción |
|----------|---------|-------------|
| `DOMAIN` | `32-195-76-205.nip.io` | Hostname para el TLS de Caddy (Elastic IP con guiones) |
| `POSTGRES_PASSWORD` | `ready` (default) | Password de Postgres (DB no expuesta → default aceptable en MVP) |
| `MVP_USER_ID` | `<uuid>` (default fijo) | Usuario único del MVP |

## Verificación rápida

```bash
curl http://localhost:3000/api/clothes/categories   # debe devolver el catálogo sembrado
```

## Troubleshooting

| Síntoma | Causa probable | Solución |
|---------|----------------|----------|
| `ECONNREFUSED` al migrar | Postgres no levantado | `npm run db:up` (o `docker compose -f compose.dev.yaml up -d postgres`) |
| Listados vacíos | Falta seed | `npm run seed` |
| App no conecta | `EXPO_PUBLIC_API_URL` apunta a `localhost` en device físico | exportar la IP LAN de la máquina |
| `expo start` muere con `EMFILE: too many open files` | Watcher de Metro vs límite de fds (macOS) | `brew install watchman` |
| Expo Go dice "incompatible / SDK X" | El Expo Go del store es más nuevo que el SDK del proyecto | el proyecto está en SDK 54 (alineado con el Expo Go actual); si subís el SDK, reinstalá deps con `npx expo install --fix` |
| `Cannot find module react-native-worklets/plugin` | `babel-preset-expo` (SDK 54) incluye el plugin de worklets | instalar `react-native-reanimated` + `react-native-worklets` (`npx expo install`) |
| `Unable to resolve react-native-css-interop/jsx-runtime` | css-interop no hoisteado (jsxImportSource nativewind) | agregarlo como dep directa: `npm i react-native-css-interop@<ver de nativewind>` |
| Deploy falla con `compose build requires buildx 0.17.0 or later` | Instancia con buildx viejo | `ready-deploy` cae solo al builder clásico (`DOCKER_BUILDKIT=0`) |
| Prisma falla en Docker (`Can't write to @prisma/engines`) | Base Alpine (musl/openssl) | imagen sobre `node:20-slim` (ya aplicado) |
