---
category: infra
source_raw: _inbox/20260620-035701-anadir-devops-architect-y-ampliar-el-mentor.md
captured_at: 2026-06-20T03:57:01+00:00
status: curated
---

# DevOps Architect + Technical Mentor en AGENTS.md

**Intención.** Sumar al `AGENTS.md` un rol **DevOps Architect** (estrategia de despliegue
simple y barata para un MVP en AWS) y **ampliar el mentor**: de "React Native Mentor" a
**Technical Mentor** que también cubre backend, AWS y DevOps. Premisa: el dueño está
aprendiendo, así que todo debe ser simple, económico y entendible.

**Contexto / decisión (DevOps Architect).** Despliegue apto-MVP, sin complejidad enterprise.
Prioridad: bajo costo → simplicidad → seguridad básica → mantenibilidad → docs → poder crecer.

- **Opciones AWS:** EC2 + Docker (aprender, barato) · Elastic Beanstalk (más gestionado) ·
  App Runner (contenedor gestionado, revisar costo).
- **Recomendación inicial:** NestJS dockerizado · PostgreSQL · **S3 para imágenes** · logs
  simples/CloudWatch · **CI/CD con GitHub Actions DESPUÉS** de que el deploy manual funcione.
- **DB:** RDS cuando el presupuesto lo permita; Postgres en Docker/EC2 solo para prototipos
  (backups manuales con `pg_dump`, riesgo explicado).
- **Secretos:** nunca en Git; `.env.example` con valores falsos; documentar toda env var.
- **Seguridad básica:** DB no pública, security groups, HTTPS, IAM con permisos limitados, CORS.
- **What Not To Do:** sin Kubernetes/Terraform/multi-cuenta/colas/autoscaling ni observabilidad
  pesada para el MVP (marcado como mejora futura).
- Formato de respuesta de 10 puntos (opción → por qué → servicios AWS → complejidad → costo →
  seguridad → plan paso a paso → env vars → qué posponer → Learning Notes).

**Contexto / decisión (Technical Mentor).** El mentor deja de ser solo RN y abarca RN, TS,
NativeWind, Zustand, TanStack Query, RHF, NestJS, PostgreSQL, Docker, AWS, CI/CD, logs,
backups y deploy. Enseña práctico y directo, comenta solo lo no obvio, explica trade-offs y
**costo/mantenimiento de AWS**, y agrega `Learning Notes` cortas tras cambios importantes.

**Coordinación con Ready.** Se reconcilió la regla "imágenes en S3" del DevOps Architect con el
`README §2.4` ("filesystem local en MVP"): **filesystem solo en dev local; cualquier target
desplegado → S3** (el contrato API expone solo `imageUrl`, el cambio FS→S3 no lo rompe).

**Resultado.** `AGENTS.md`: rol 5 *Technical Mentor* (reemplaza al RN Mentor), rol 6 *DevOps
Architect*; lista de roles y *Regla de selección* actualizadas. Ver [[01-hook-drift-arquitectura]]
y [[../meta/04-contrato-roles-agents]].
