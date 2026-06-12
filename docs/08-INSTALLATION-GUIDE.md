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
