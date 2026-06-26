#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# Bootstrap de una instancia EC2 (Amazon Linux 2023) para correr el stack Ready.
# Se puede pegar como "user data" al lanzar la instancia, o correr una vez por SSH.
# Instala Docker + el plugin de compose v2 y deja al usuario ec2-user listo.
# ─────────────────────────────────────────────────────────────────────────────
set -euo pipefail

dnf update -y
dnf install -y docker git
systemctl enable --now docker

# Permite correr docker sin sudo (re-loguear SSH para que tome el grupo).
usermod -aG docker ec2-user

# Plugin de compose v2 (AL2023 no lo trae empaquetado).
PLUGIN_DIR=/usr/libexec/docker/cli-plugins
mkdir -p "$PLUGIN_DIR"
ARCH="$(uname -m)" # x86_64 o aarch64
curl -SL "https://github.com/docker/compose/releases/latest/download/docker-compose-linux-${ARCH}" \
  -o "$PLUGIN_DIR/docker-compose"
chmod +x "$PLUGIN_DIR/docker-compose"

echo "Bootstrap OK. Verificá: docker --version && docker compose version"
