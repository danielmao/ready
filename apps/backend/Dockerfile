# syntax=docker/dockerfile:1

# ─────────────────────────────────────────────────────────────────────────────
# Etapa 1: build — instala TODO (incluye devDeps) y compila TS → JS (dist/).
# ─────────────────────────────────────────────────────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app

# Copiamos solo los manifiestos primero para aprovechar la cache de capas de Docker:
# si package*.json no cambian, npm ci no se reejecuta aunque cambie el código.
COPY package.json package-lock.json ./
RUN npm ci

# Ahora sí el código y la config de compilación.
COPY tsconfig.json nest-cli.json ./
COPY src ./src
RUN npm run build

# ─────────────────────────────────────────────────────────────────────────────
# Etapa 2: runtime — imagen final mínima, solo deps de producción + dist/.
# ─────────────────────────────────────────────────────────────────────────────
FROM node:20-alpine AS runtime
ENV NODE_ENV=production
WORKDIR /app

# Solo dependencies (sin devDeps): la imagen final no trae el compilador TS ni jest.
COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force

# El artefacto compilado viene de la etapa builder; el código fuente TS no entra.
COPY --from=builder /app/dist ./dist

# Correr como usuario no-root (el usuario `node` ya existe en la imagen oficial).
USER node

EXPOSE 3000
CMD ["node", "dist/main.js"]
