---
name: ready-deploy
description: >-
  Operá el deploy del backend de Ready en AWS (1 instancia EC2 con Docker +
  Caddy): prender, apagar, ver estado y re-desplegar una rama. Usá esta skill
  cuando el usuario diga "prendé/levantá la instancia", "apagá/detené el server",
  "está arriba la API?", "qué estado tiene el deploy", "redeployá", "subí los
  cambios al server", "desplegá la rama X", "actualizá el deploy", o pregunte por
  el health público de Ready. Una sola herramienta para las 4 acciones; la rama
  es opcional en deploy. Se apoya en la skill `aws-account` (cuenta personal) y
  verifica la identidad antes de tocar nada. Específica del deploy de Ready.
---

# Operar el deploy de Ready (EC2 + Docker + Caddy)

Una sola herramienta para el ciclo de vida del deploy del backend de Ready. Todo pasa por
la skill `aws-account` (perfil `personal`), que **verifica la identidad antes de actuar**
para no tocar la cuenta equivocada.

```bash
.claude/skills/ready-deploy/run.sh <status|start|stop|deploy> [rama]
```

| Acción | Qué hace |
|--------|----------|
| `status` | Estado de la instancia + `GET https://<dominio>/api/health`. Read-only, seguro. |
| `start`  | Prende la instancia. La Elastic IP sigue asociada y los contenedores tienen `restart: unless-stopped`, así que la URL vuelve sola. |
| `stop`   | Detiene la instancia (reversible — no borra nada). Avisa del mini-cargo de la EIP detenida. |
| `deploy [rama]` | Prende si está detenida, hace `git fetch`+checkout de la **rama** (opcional; default = la rama desplegada), `pull`, reescribe el `.env` con el `DOMAIN` y levanta el stack. Health al final. |

## Cuándo usar cada una

- "apagá / detené" → `stop` · "prendé / levantá" → `start`.
- "está arriba?" / "qué estado" → `status`.
- "redeployá" / "subí los cambios" / "desplegá la rama X" → `deploy [rama]`.

## Notas de diseño

- **Rama opcional en deploy.** Sin argumento usa la rama desplegable por defecto
  (`feature-entrega2-dmtu`, la entrega 2 con el backend). `main` es solo docs (entrega 1)
  y NO es deployable. Pasá otra rama para desplegarla: `run.sh deploy <rama>`.
- **buildx.** `docker compose --build` lo exige; si el host no lo tiene (instancia vieja,
  bootstrapeada antes del fix), el deploy cae al **builder clásico** (`DOCKER_BUILDKIT=0`)
  automáticamente. Las instancias nuevas ya traen buildx por el `bootstrap.sh`.
- **Datos del deploy** (instance id, EIP, dominio) están hardcodeados en `run.sh` y también
  en la memoria del proyecto. Si se recrea la instancia, actualizá ambos.
- **Costos / teardown destructivo** (terminar + soltar EIP) NO están en esta skill a
  propósito: es una acción de una sola vez, documentada en la memoria del proyecto y en
  `learnings/01-primer-deploy-aws.md §5`.
- Prerrequisitos: skill `aws-account` configurada (perfil `personal`) y `~/.ssh/ready-mvp.pem`.
