#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# Operación del deploy de Ready en AWS (EC2 + Docker + Caddy).
# Una sola herramienta para prender, apagar, ver estado y re-desplegar.
#
# Uso:
#   run.sh status                 # estado de la instancia + health público
#   run.sh start                  # prende la instancia (la URL vuelve sola)
#   run.sh stop                   # detiene la instancia (reversible)
#   run.sh deploy [rama]          # prende si hace falta, trae la rama y redeploya
#                                 # rama opcional (default: la rama desplegada)
#
# Se apoya en la skill `aws-account` (verifica que sea la cuenta personal antes
# de tocar nada). NO maneja secretos. Datos del deploy: ver memoria del proyecto.
# ─────────────────────────────────────────────────────────────────────────────
set -euo pipefail

# --- Config del deploy de Ready (cuenta personal) ---
PROFILE="personal"
INSTANCE_ID="i-09ed3441754a9b223"
EIP="32.195.76.205"
DOMAIN="32-195-76-205.nip.io"
PEM="${HOME}/.ssh/ready-mvp.pem"
DEFAULT_BRANCH="feature-entrega2-dmtu"
AWS_AS="${HOME}/.claude/skills/aws-account/aws-as.sh"

SSH_OPTS=(-i "$PEM" -o StrictHostKeyChecking=accept-new -o ConnectTimeout=15)
# Filtra el warning ruidoso de post-quantum de OpenSSH reciente.
NOISE='post-quantum|store now|may need to be upgraded|openssh.com/pq'

aws_p() { "$AWS_AS" "$PROFILE" "$@"; }

state() {
  aws_p ec2 describe-instances --instance-ids "$INSTANCE_ID" \
    --query 'Reservations[0].Instances[0].State.Name' --output text
}

wait_ssh() {
  # sshd puede tardar tras el boot; ConnectTimeout pacea los reintentos sin sleep.
  local n=0
  until ssh "${SSH_OPTS[@]}" -o BatchMode=yes "ec2-user@${EIP}" 'true' 2>/dev/null; do
    n=$((n+1)); echo "  esperando sshd... (intento $n)" >&2
    [ "$n" -ge 12 ] && { echo "✗ no pude conectar por SSH" >&2; return 1; }
  done
}

ensure_running() {
  local s; s="$(state)"
  if [ "$s" != "running" ]; then
    echo ">>> instancia en '$s' → prendiendo..."
    aws_p ec2 start-instances --instance-ids "$INSTANCE_ID" >/dev/null
    aws_p ec2 wait instance-running --instance-ids "$INSTANCE_ID"
    echo ">>> esperando status checks (instance-status-ok)..."
    aws_p ec2 wait instance-status-ok --instance-ids "$INSTANCE_ID"
  fi
}

ACTION="${1:-}"
BRANCH="${2:-$DEFAULT_BRANCH}"

case "$ACTION" in
  status)
    echo ">>> instancia: $(state)"
    echo ">>> health público:"
    curl -fsS -m 15 -w '\n[http %{http_code}] [%{time_total}s]\n' \
      "https://${DOMAIN}/api/health" || echo "(no responde — ¿detenida o aún levantando?)"
    ;;

  start)
    ensure_running
    echo ">>> verificando health (los contenedores arrancan con el boot)..."
    curl -fsS -m 90 --retry 18 --retry-delay 5 --retry-all-errors \
      -w '\n[http %{http_code}]\n' "https://${DOMAIN}/api/health" \
      && echo "✓ arriba: https://${DOMAIN}/api/health" \
      || echo "✗ no respondió aún; revisá con: run.sh status"
    ;;

  stop)
    echo ">>> deteniendo instancia (reversible)..."
    aws_p ec2 stop-instances --instance-ids "$INSTANCE_ID" \
      --query 'StoppingInstances[0].{id:InstanceId,now:CurrentState.Name}' --output table
    echo "ℹ una EIP asociada a una instancia detenida factura ~USD 0.005/h. Para cero: terminar + release (ver memoria)."
    ;;

  deploy)
    ensure_running
    wait_ssh
    echo ">>> desplegando rama '$BRANCH' en el host..."
    # Credenciales S3 de la app: se leen del .env.deploy local (gitignored, user scopeado
    # ready-app-s3), NO del perfil deployer. Se inyectan en el .env del host EC2.
    ENV_DEPLOY="$(cd "$(dirname "${BASH_SOURCE[0]}")/../../.." && pwd)/apps/backend/.env.deploy"
    S3_ACCESS_KEY=""; S3_SECRET_KEY=""
    if [ -f "$ENV_DEPLOY" ]; then
      set -a; . "$ENV_DEPLOY"; set +a
      echo ">>> credenciales S3 cargadas de .env.deploy"
    else
      echo ">>> sin .env.deploy: la app arranca sin S3 (subir imágenes fallará)"
    fi
    ssh "${SSH_OPTS[@]}" "ec2-user@${EIP}" \
      BRANCH="$BRANCH" DOMAIN="$DOMAIN" \
      S3_BUCKET_NAME="ready-uploads" AWS_REGION="us-east-1" \
      S3_ACCESS_KEY="$S3_ACCESS_KEY" S3_SECRET_KEY="$S3_SECRET_KEY" \
      'bash -s' <<'REMOTE' 2>&1 | grep -vE "$NOISE"
set -e
cd ready
git fetch --quiet origin
git checkout --quiet "$BRANCH"
git pull --quiet --ff-only
echo "HEAD: $(git log -1 --oneline)"
cd apps/backend
# .env del host (no versionado): DOMAIN + credenciales S3 reales de la app.
cat > .env <<ENV
DOMAIN=$DOMAIN
S3_BUCKET_NAME=$S3_BUCKET_NAME
AWS_REGION=$AWS_REGION
S3_ACCESS_KEY=$S3_ACCESS_KEY
S3_SECRET_KEY=$S3_SECRET_KEY
IMAGE_PUBLIC_BASE_URL=https://$DOMAIN
ENV
# `docker compose build` exige buildx >= 0.17; si está ausente o es muy viejo (instancias
# bootstrapeadas antes del fix traen 0.12), cae al builder clásico. En vez de chequear la
# versión, intentamos el build de compose y, si falla, usamos DOCKER_BUILDKIT=0 (self-healing).
if docker compose build 2>/dev/null; then
  docker compose up -d
else
  echo ">>> buildx ausente o viejo → builder clásico (DOCKER_BUILDKIT=0)"
  DOCKER_BUILDKIT=0 docker build -t backend-api:latest .
  docker compose up -d --no-build
fi
docker compose ps --format 'table {{.Service}}\t{{.Status}}'
REMOTE
    echo ">>> verificando health público..."
    curl -fsS -m 90 --retry 12 --retry-delay 5 --retry-all-errors \
      -w '\n[http %{http_code}]\n' "https://${DOMAIN}/api/health" \
      && echo "✓ deploy OK: https://${DOMAIN}/api/health"
    ;;

  *)
    cat >&2 <<EOF
uso: run.sh <status|start|stop|deploy> [rama]
  status            estado de la instancia + health público
  start             prende la instancia (la URL vuelve sola)
  stop              detiene la instancia (reversible)
  deploy [rama]     prende si hace falta + trae la rama + redeploya
                    (rama opcional; default: $DEFAULT_BRANCH)
EOF
    exit 2
    ;;
esac
