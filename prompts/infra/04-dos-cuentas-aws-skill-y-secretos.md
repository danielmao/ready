---
category: infra
source_raw: _inbox/20260626-045223-config-vammo-y-personal-skill-y-keys.md
captured_at: 2026-06-26T04:52:23+00:00
status: curated
---

# Dos cuentas AWS (Vammo + personal): cómo manejarlas y dónde van los secretos

**Intención.** El dueño ya tenía configurada la cuenta AWS de la empresa (Vammo) y quería usar
una **personal** para Ready. Tres preguntas: ¿cómo conviven las dos cuentas?, ¿conviene una
skill (global) para elegir entre ellas?, y ¿puede pegar las access keys en un `.env` para que
el agente las use?

**Contexto / decisión.**

- **Convivencia → perfiles con nombre de AWS CLI.** Vammo ya estaba por **SSO** (`vammo-dev`,
  `vammo-prod`, us-west-2); la personal se agrega como perfil `personal` con access keys del
  IAM `ready-mvp-deployer` (us-east-1). Cada comando elige cuenta con `--profile`. No se mezclan.
- **Secretos → NO en un `.env` del repo ni en el chat.** Las access keys van a
  `~/.aws/credentials` bajo `[personal]`, escritas por el propio dueño con `aws configure`, para
  que nunca pasen por la conversación (es justo el riesgo "secreto filtrado" de severidad alta
  del spec). El `.env` del deploy solo referencia el nombre del perfil.
- **Skill → sí, global.** Se creó `aws-account` (espejo de la skill `clone-repo`, que hace lo
  mismo para la identidad de GitHub): elige el perfil correcto y **verifica la identidad antes**
  de cualquier acción facturable, para no crear recursos personales en la cuenta de Vammo ni al
  revés. Maneja el re-login SSO de los perfiles de Vammo.

**Resultado.** Skill global `aws-account` (`~/.claude/skills/aws-account/`) + perfil `personal`
verificado contra `ready-mvp-deployer`. Ver el tutorial
[`learnings/01-primer-deploy-aws.md`](../../learnings/01-primer-deploy-aws.md) §1.1.
