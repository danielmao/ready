---
title: Primer deploy del backend con ruta de health
status: draft
size_class: medium
owner: @devops-architect
ticket: no aplica (sin tickets en el MVP)
created: 2026-06-19
last_updated: 2026-06-19
---

# Primer deploy del backend con ruta de health

- **Status:** draft
- **Size class:** medium
- **Owner:** @devops-architect
- **Ticket:** no aplica (sin tickets en el MVP)
- **Created:** 2026-06-19

> Spec del "qué" + `## Technical design` (el "cómo") ya resuelto por el **DevOps Architect**.
> Decisión de deploy: **EC2 + Docker**, HTTPS terminado con **Caddy en el host**.

## Problema

Hoy `apps/backend` no existe como aplicación ejecutable: sólo hay la config de boundaries
(`apps/backend/.dependency-cruiser.cjs`) y notas de setup (`apps/backend/ARCH-SETUP.md`). No
hay forma de verificar que la API NestJS arranca y es alcanzable fuera de la máquina local,
ni un esqueleto de despliegue sobre el cual iterar. Antes de implementar dominios
(`clothes → outfits → planning`) necesitamos un "hola mundo" desplegado y monitoreable: la
ruta de health es la pieza mínima que prueba, de punta a punta, que el contenedor corre, el
puerto está expuesto y el host responde por HTTPS. Es el andamio del que cuelga todo lo demás.

## Goals

- Existe un esqueleto NestJS mínimo en `apps/backend` que arranca con `npm run start:dev` y
  expone `GET /api/health`.
- `GET /api/health` responde `200` con un cuerpo JSON de liveness (`status`, `service`,
  `version`, `uptime`) en **< 200 ms** y **sin tocar la base de datos**.
- El backend queda desplegado en un entorno AWS **públicamente alcanzable por HTTPS**, y
  `GET https://<host>/api/health` responde `200` desde fuera de la red local.
- El enforcement de arquitectura queda activo en el repo desplegable: `npm run lint:arch`
  pasa (fusionando el bloque de `apps/backend/ARCH-SETUP.md` en el `package.json` generado).
- Queda documentado el procedimiento de deploy manual reproducible (env vars incluidas) en
  `docs/08-INSTALLATION-GUIDE.md`.

## Non-goals

- **No** incluye CI/CD: el deploy es **manual** en esta primera vuelta (GitHub Actions =
  iteración posterior, decisión ya registrada en el rol DevOps Architect de `AGENTS.md`).
- **No** incluye base de datos gestionada (RDS) ni conexión a Postgres desde el host: el
  health es un *liveness* puro, sin readiness con dependencias.
- **No** incluye ningún dominio de negocio (`clothes`/`outfits`/`planning`/`users`) ni
  endpoints de producto.
- **No** incluye autenticación, S3, ni el guard `@CurrentUser`.
- **No** incluye autoscaling, observabilidad pesada, colas, Terraform ni Kubernetes
  (explícitamente fuera del MVP por el rol DevOps Architect).

## Módulos / servicios afectados

- `apps/backend` — esqueleto nuevo: `src/main.ts`, `src/app.module.ts`, y la ruta de health
  como infra transversal en `src/shared/` (controller de health). **No** es un dominio de
  negocio (no va bajo `src/{domain}/`); es cross-cutting (`docs/02-ARCHITECTURE.md §3`,
  layout `src/shared/` = "infra transversal sin lógica de negocio").
- `apps/backend/package.json` (nuevo) — fusionar `lint:arch` + devDep `dependency-cruiser`
  según `apps/backend/ARCH-SETUP.md §1`.
- `apps/backend/.env.example` (nuevo) — `PORT`, y placeholders de las vars que el deploy
  necesite (sin secretos reales).
- `docs/02-ARCHITECTURE.md §5` — actualizar: el despliegue deja de ser "sólo local".
- `docs/08-INSTALLATION-GUIDE.md` — agregar sección de deploy.
- `apps/mobile` — **ninguno** (no existe aún y el health no lo consume).

## Contratos afectados

| Tipo | Superficie | Cambio | ¿Rompe? | Consumidores |
|---|---|---|---|---|
| HTTP | `GET /api/health` | nuevo | no | ninguno hoy (futuro: monitor de uptime / health check del host) |
| DB | — | ninguno | no | — |
| Tipo compartido | — | ninguno | no | — |

> No hay contrato que rompa: es un endpoint nuevo sin consumidores existentes.

## Impacto backend

Se crea el bootstrap de NestJS (`main.ts` con prefijo global `/api`, `app.module.ts`) y un
`HealthController` en `src/shared/` que devuelve un payload de liveness estático/calculado en
memoria. No se agregan use-cases, facades ni repositorios de dominio, así que no hay flujo
`infra → application → domain` que ejercitar todavía; el health vive enteramente en la capa de
infraestructura transversal y no importa de ningún dominio (respeta los boundaries de §3/§6).
El cambio activa por primera vez `dependency-cruiser` sobre código real.

## Impacto frontend

Ninguno — sólo backend. `apps/mobile` no existe aún y no consume el health en esta vuelta.

## Impacto de base de datos

Ninguno. El health es liveness puro; no hay migración Prisma, ni columnas, ni seed. La
conexión a Postgres y un readiness con chequeo de DB quedan para una iteración posterior.

## Edge cases

- App arriba pero puerto/host mal expuesto → `GET /api/health` debe seguir respondiendo `200`
  localmente dentro del contenedor; si falla desde afuera, el problema es de networking
  (security group / puerto), no de la app. El criterio de aceptación distingue ambos.
- Petición a una ruta inexistente (`GET /api/nope`) → `404` de NestJS (confirma que el
  prefijo global y el router están activos).
- Reinicio del contenedor → `uptime` se resetea (esperado; documenta que es liveness, no un
  contador persistente).
- Acceso por HTTP plano cuando se espera HTTPS → comportamiento documentado (redirect o
  rechazo) según lo decida el Technical design.

## Criterios de aceptación

- [ ] `cd apps/backend && npm run start:dev` levanta la API sin errores.
- [ ] `curl -s localhost:3000/api/health` devuelve `200` y un JSON con `status: "ok"`,
      `service`, `version` y `uptime`.
- [ ] `curl -s localhost:3000/api/nope` devuelve `404` (prefijo `/api` y router activos).
- [ ] El endpoint responde sin que haya ninguna conexión a Postgres configurada (liveness no
      depende de la DB).
- [ ] `cd apps/backend && npm run lint:arch` pasa en verde.
- [ ] Tras el deploy, `curl -s https://<host>/api/health` devuelve `200` desde una red
      distinta a la del host.
- [ ] `docs/08-INSTALLATION-GUIDE.md` describe el deploy manual reproducible, con todas las
      env vars y sin secretos en el repo (`.env.example` con valores falsos).
- [ ] `docs/02-ARCHITECTURE.md §5` refleja el nuevo alcance de despliegue (y, si aplica,
      hay una fila nueva en la tabla de ADRs §2).

## Plan de test

- **Unit:** `health.controller.spec.ts` — el controller devuelve `status: "ok"` y un shape
  con `service`/`version`/`uptime` (1–2 asserts, sin sobre-especificar; reglas de test de
  `docs/CODING-CONVENTIONS.md §4`).
- **E2E:** smoke por HTTP contra la API local (`GET /api/health` → 200, `GET /api/nope` →
  404). Encaja con la skill `e2e-local` una vez exista el backend.
- **Deploy (manual):** checklist de verificación post-deploy = los criterios de aceptación de
  `https://<host>/api/health` desde fuera de la red.

## Rollout

- **Feature flag:** no aplica en MVP.
- **Orden de despliegue:** scaffold backend (local, verde) → contenerizar → deploy manual al
  host → verificar `/api/health` público. Sin DB en esta vuelta.
- **Rollback:** al ser el primer deploy y no haber estado/DB, el rollback es detener/eliminar
  el recurso desplegado. Sin migraciones que revertir.

## Preguntas abiertas

_Todas resueltas (2026-06-19):_

- [x] Target de deploy → **EC2 + Docker** (1 instancia). Beanstalk/App Runner descartados
      para el MVP por costo/simplicidad.
- [x] Terminación HTTPS → **Caddy en el host** como reverse-proxy con TLS automático
      (Let's Encrypt). Evita el costo del ALB; encaja con "AWS básico".
- [x] Ticket `RDY-N` → **no se crean tickets** en el MVP.
- [x] Alcance de despliegue en `docs/02-ARCHITECTURE.md §5` → se actualiza a **"AWS básico
      (EC2 + Docker, deploy manual)"** y se registra ADR en §2 (parte de los criterios de
      aceptación / implementación).
- [x] Dominio/subdominio para el TLS de Caddy → **no hay dominio todavía**: se usa
      **`nip.io` sobre la Elastic IP** (p. ej. `<ip-con-guiones>.nip.io`), que resuelve a la
      IP sin configurar DNS y permite a Caddy emitir un cert real de Let's Encrypt. Migrar a
      `api.<dominio>` (sólo cambiar el A record + el host en `Caddyfile`) cuando exista
      dominio — no rompe el contrato `/api/health`.

---

## Technical design

> Resuelto por el **DevOps Architect** (2026-06-19). Prioridades del rol: bajo costo →
> simplicidad → seguridad básica → mantenibilidad → docs → poder crecer.

### Resumen del enfoque

**Una sola instancia EC2 con Docker**, y **Caddy en el host** terminando HTTPS y
proxy-reverso al contenedor de la API. Es lo más barato y entendible para un MVP de una
persona: sin ALB (ahorra ~USD 16/mes), sin servicio gestionado, sin CI/CD. Caddy obtiene y
renueva el certificado TLS de Let's Encrypt automáticamente, así que no hay que tocar ACM ni
manejar certificados a mano. Todo el stack se levanta con un `docker compose up -d` en el host
desde un `compose.yaml` con dos servicios: `api` (imagen NestJS) y `caddy`.

- **Cómputo:** 1× EC2 `t3.micro` (free tier 12 meses) o `t4g.small` (ARM, barato) con Amazon
  Linux 2023 + Docker. **Elastic IP** para que la IP no cambie en reinicios.
- **Red/seguridad básica:** Security Group expone **sólo 80 + 443** al mundo y **22 sólo
  desde la IP del dev**. No hay puerto de DB abierto (no hay DB en esta vuelta). La API
  escucha en `:3000` **dentro** de la red de Docker; no se publica al host — sólo Caddy la
  alcanza.
- **TLS/HTTPS:** Caddy escucha `:80`/`:443`, redirige HTTP→HTTPS y proxya a `api:3000`.
  Como **no hay dominio todavía**, se usa **`<elastic-ip-con-guiones>.nip.io`** como host en
  el `Caddyfile`: resuelve a la Elastic IP sin tocar DNS y permite emitir cert real de
  Let's Encrypt. Migrar a `api.<dominio>` = cambiar A record + host del Caddyfile.
- **Imagen:** Dockerfile multi-stage (build con devDeps → runtime `node:20-alpine` slim,
  `npm ci --omit=dev`, usuario no-root). Se construye en el host con `docker compose build`
  (sin registry en esta vuelta; ECR = mejora futura).
- **Secretos/config:** `.env` en el host (fuera de git); `.env.example` en el repo con
  valores falsos. CORS habilitado pero restringido (placeholder hasta que exista mobile).
- **Logs:** `nestjs-pino` a stdout → `docker logs` / journald. CloudWatch agent = futuro.

### Contratos cambiados (detalle)

| Contrato | Shape viejo | Shape nuevo | Acción del consumidor |
|---|---|---|---|
| `GET /api/health` | no existía | `200 { status:"ok", service:"ready-backend", version:<string>, uptime:<seconds> }` | ninguna (sin consumidores; futuro health-check del host / monitor de uptime) |

### Diagrama de secuencia

```mermaid
sequenceDiagram
  participant C as Cliente (curl / monitor)
  participant DNS as DNS (api.&lt;dominio&gt;)
  participant Caddy as Caddy (host :443, TLS)
  participant API as Nest API (contenedor :3000)
  C->>DNS: resuelve api.&lt;dominio&gt;
  DNS-->>C: Elastic IP
  C->>Caddy: GET /api/health (HTTPS)
  Caddy->>API: proxy GET /api/health (HTTP interno)
  API->>API: arma liveness (status/version/uptime) — sin DB
  API-->>Caddy: 200 JSON
  Caddy-->>C: 200 JSON (TLS)
```

### Plan de ejecución

> Una fila = un PR. Ramas encadenadas desde `feat/backend-first-deploy-health`.

| # | Fase | Área | PR (título propuesto) | Depende de | Estado |
|---|---|---|---|---|---|
| 1 | Scaffold | backend | `feat(backend): esqueleto NestJS + GET /api/health (liveness, sin DB)` | — | in-progress |
| 2 | Enforcement | backend | `chore(backend): activar lint:arch (fusionar ARCH-SETUP en package.json)` | #1 | in-progress (fusionado en #1) |
| 3 | Contenerizar | backend/infra | `feat(infra): Dockerfile multi-stage + compose.yaml (api + caddy)` | #1 | not-started |
| 4 | Deploy | infra | `feat(infra): provisión EC2 + Elastic IP + SG (80/443/22) y deploy manual` | #3 | not-started |
| 5 | Docs | docs | `docs: deploy AWS básico en 08-INSTALLATION-GUIDE + §5/ADR en 02-ARCHITECTURE` | #4 | not-started |

Estados: `not-started | in-progress | open | merged | blocked`.

### Riesgos

| Riesgo | Severidad | Mitigación |
|---|---|---|
| Sin dominio propio aún | low | Se usa `nip.io` sobre la Elastic IP → cert real de Let's Encrypt sin DNS; migrar a dominio propio es un cambio de A record + Caddyfile, no rompe el contrato |
| `t3.micro` se queda corta de RAM al sumar dominios/DB | low | Es el primer deploy (sólo health); escalar a `t4g.small`/`medium` es un cambio de tipo de instancia |
| Postgres en el mismo EC2 más adelante sin backups | med | Fuera de alcance de esta spec; el rol DevOps Architect ya marca RDS / `pg_dump` cuando entre la DB |
| Secreto filtrado al repo | high | `.env` gitignored, `.env.example` con valores falsos, revisión de `git status` antes de commitear |
| Puerto 22 abierto al mundo | med | SG restringe 22 a la IP del dev; nunca `0.0.0.0/0` en SSH |
