#!/bin/sh
# Arranque del contenedor de la API en producción.
# 1) Aplica migraciones Prisma (idempotente — sólo las pendientes).
# 2) Siembra catálogos + user MVP (idempotente — upserts; no aborta el arranque si falla).
# 3) Levanta la API.
set -e

echo "[entrypoint] prisma migrate deploy..."
npx prisma migrate deploy

echo "[entrypoint] seed (idempotente)..."
npx prisma db seed || echo "[entrypoint] seed falló — continuo igual (catálogos se pueden re-sembrar)."

echo "[entrypoint] iniciando API..."
exec node dist/main.js
