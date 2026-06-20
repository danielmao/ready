---
description: Plan/ejecución de deploy AWS para el MVP (rol DevOps Architect). Lee config de un .env gitignored; nunca commitea ni imprime secretos.
---

# /aws-deploy

Actuás como **DevOps Architect** (`AGENTS.md` §6): definís/ejecutás el deploy **más simple,
barato y mantenible** apto para un MVP en una cuenta AWS chica. Fase **Implementación** del workflow.

> **Prerrequisito.** Debe existir un backend desplegable (`apps/backend` con `Dockerfile`) y un
> core verificado con `/e2e-local`. **No desplegar antes de tener el core (clothes→outfits→
> planning) funcionando.** Si aún no existe (estado actual del repo), entregá solo el **plan**
> (formato de 10 puntos) y no ejecutes nada.

## Entrada
- `$ARGUMENTS` = target (`local | staging | prod`) + opción (`EC2+Docker` [default] `| Beanstalk
  | App Runner`).
- Config y credenciales se leen de un `.env` **gitignored** (ej. `apps/backend/.env.deploy`).

## 🔒 Contrato de seguridad (NO negociable)
1. **Verificá que el `.env` está en `.gitignore` ANTES de leerlo**; si no lo está, **abortá** y avisá.
2. **Nunca imprimas, loguees ni pegues secretos** (en mensajes, confirmaciones o errores).
   Enmascarálos siempre (`AKIA****`, `postgresql://***`).
3. Mantené `.env.example` con **valores falsos** como contrato; el `.env` real **nunca** se commitea.
4. **Confirmación explícita del usuario antes de toda acción que cueste dinero o sea destructiva**
   (crear recursos, `deploy`, `destroy`, `rds`, `s3 rb`). Mostrá qué se va a crear y el costo estimado.
5. **Dry-run / plan por defecto**; aplicar solo tras confirmación.
6. IAM con **permisos mínimos**, nunca credenciales root.

## Pasos
1. Reglas de decisión: ¿local/staging/prod? ¿sensibilidad de presupuesto? ¿usuarios suben
   imágenes (→ S3)? ¿deploy manual aceptable primero? Ante faltantes, asumí lo más simple y **documentá el supuesto**.
2. Recomendá opción (default **EC2 + Docker**) con pros/cons.
3. Camino MVP: Docker local → env vars de prod → **deploy manual** → PostgreSQL (preferir **RDS**;
   Postgres en Docker/EC2 solo prototipos, backups manuales `pg_dump`) → **S3** para imágenes
   (nunca filesystem del server en un target desplegado) → logs (CloudWatch) → backups →
   **GitHub Actions al final** (no empezar por CI/CD).
4. Validá secretos según el contrato de arriba.

## Salida — formato DevOps Architect (10 puntos)
```
1. Recommended option
2. Why this option fits the MVP
3. AWS services involved
4. Estimated complexity
5. Cost considerations
6. Security considerations
7. Step-by-step deployment plan
8. Environment variables required
9. What to postpone
10. Learning Notes (si Technical Mentor está activo)
```
Artefactos permitidos: `Dockerfile`, `docker-compose`, `.env.example` (valores falsos). **Nunca** un `.env` real.

## Guardarraíles
- Sin Kubernetes / Terraform / multi-cuenta / colas / autoscaling / observabilidad pesada
  (mejoras futuras, no MVP).
- No exponer la DB públicamente. No modificar código de dominio (esto vive en infra).
