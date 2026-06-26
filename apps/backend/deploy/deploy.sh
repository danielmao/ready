#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# Deploy / actualización del stack en el host EC2.
# Idempotente: trae el código, rebuildea la imagen y levanta api + caddy.
# Correr desde el host, dentro de apps/backend/:  ./deploy/deploy.sh
# ─────────────────────────────────────────────────────────────────────────────
set -euo pipefail

cd "$(dirname "$0")/.."   # → apps/backend/

if [[ ! -f .env ]]; then
  echo "ERROR: falta apps/backend/.env con DOMAIN=<ip-con-guiones>.nip.io" >&2
  echo "       Copialo de .env.example y completá DOMAIN." >&2
  exit 1
fi

# Trae los últimos cambios (deploy manual = git pull en el host).
git pull --ff-only

# Build + arranque en segundo plano. Caddy emite/renueva el TLS solo.
docker compose up -d --build
docker compose ps

# Verificación post-deploy (criterio de aceptación del spec).
# shellcheck disable=SC1091
source .env
echo "Esperando a que el stack levante y Caddy emita el certificado..."
sleep 8
if curl -fsS "https://${DOMAIN}/api/health"; then
  echo "  ✓ https://${DOMAIN}/api/health respondió 200"
else
  echo "  ✗ health falló — revisá: docker compose logs --tail=50" >&2
  exit 1
fi
