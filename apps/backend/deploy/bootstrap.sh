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

# Plugin buildx (AL2023 tampoco lo trae). `docker compose up --build` lo EXIGE en
# compose v2.17+/v5: sin buildx el build aborta con "requires buildx 0.17.0 or later".
case "$ARCH" in x86_64) BX_ARCH=amd64 ;; aarch64) BX_ARCH=arm64 ;; *) BX_ARCH="$ARCH" ;; esac
BX_VER="$(curl -fsSL https://api.github.com/repos/docker/buildx/releases/latest | grep -m1 '"tag_name"' | cut -d'"' -f4)"
curl -SL "https://github.com/docker/buildx/releases/download/${BX_VER}/buildx-${BX_VER}.linux-${BX_ARCH}" \
  -o "$PLUGIN_DIR/docker-buildx"
chmod +x "$PLUGIN_DIR/docker-buildx"

echo "Bootstrap OK. Verificá: docker --version && docker compose version && docker buildx version"
