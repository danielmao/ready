# syntax=docker/dockerfile:1

# ─────────────────────────────────────────────────────────────────────────────
# Etapa 1: build — instala TODO (incluye devDeps), genera el cliente Prisma y
# compila TS → JS (dist/).
# ─────────────────────────────────────────────────────────────────────────────
# Base Debian slim (no Alpine): Prisma necesita libssl/openssl; en Alpine (musl) el motor
# se intenta descargar en runtime y falla. Slim trae openssl 3 y los engines correctos.
FROM node:20-slim AS builder
WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends openssl \
  && rm -rf /var/lib/apt/lists/*

# Manifiestos primero para aprovechar la cache de capas (npm ci no se reejecuta si
# package*.json no cambian).
COPY package.json package-lock.json ./
RUN npm ci

# Esquema Prisma antes de generar el cliente.
COPY prisma ./prisma
RUN npx prisma generate

# Código + config de compilación.
COPY tsconfig.json nest-cli.json ./
COPY src ./src
RUN npm run build

# ─────────────────────────────────────────────────────────────────────────────
# Etapa 2: runtime — imagen final. Trae node_modules completo del builder (incluye
# el cliente Prisma generado + la CLI de Prisma + ts-node para migrate/seed al
# arrancar). Para el MVP prima la fiabilidad del arranque (migrar la DB) sobre el
# tamaño de imagen; afinar a sólo prod-deps es una mejora futura.
# ─────────────────────────────────────────────────────────────────────────────
FROM node:20-slim AS runtime
ENV NODE_ENV=production
WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends openssl \
  && rm -rf /var/lib/apt/lists/*

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY package.json package-lock.json tsconfig.json ./
COPY prisma ./prisma
COPY docker-entrypoint.sh ./
RUN chmod +x docker-entrypoint.sh

# Usuario no-root (ya existe en la imagen oficial). Puede leer node_modules y migrar.
USER node

EXPOSE 3000
# El entrypoint aplica migraciones + seed (idempotentes) y luego arranca la API.
CMD ["./docker-entrypoint.sh"]
