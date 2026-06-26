---
category: infra
source_raw: _inbox/20260626-045222-que-necesitas-de-aws-aca.md
captured_at: 2026-06-26T04:52:22+00:00
status: curated
---

# ¿Qué hace falta de AWS para el primer deploy?

**Intención.** Antes de ejecutar el primer despliegue del backend, entender qué se necesita
concretamente de AWS (credenciales, recursos, permisos) en vez de improvisar sobre la marcha.

**Contexto / decisión.** Con el spec `backend-first-deploy-health` ya cerrado (EC2 + Docker +
Caddy, ver [[02-devops-architect-y-technical-mentor]]), se inventarió lo mínimo del lado de AWS:

- **AWS CLI con un IAM propio (no root)** con permisos acotados de EC2 + `ssm:GetParameters`.
- **Un EC2 key pair** (`ready-mvp`) para SSH al host, con la `.pem` en `~/.ssh`.
- **Región** (`us-east-1`) y **autorización explícita** para crear recursos facturables.
- **No** hacen falta dominio/DNS, ACM, ALB, RDS ni ECR: `nip.io` + Caddy cubren el HTTPS y el
  resto queda fuera del MVP.

**Resultado.** Kickoff del deploy. El paso a paso completo (con los tropiezos reales) quedó como
tutorial en [`learnings/01-primer-deploy-aws.md`](../../learnings/01-primer-deploy-aws.md).
