---
category: backend
source_raw: _inbox/20260620-033922-no-cambies-la-estructura-del-backend-que.md
captured_at: 2026-06-20T03:39:22+00:00
status: curated
---

# Mantener la estructura backend DDD por capas existente

**Intención.** Conservar la arquitectura backend ya definida y rechazar la estructura
simplificada propuesta en el prompt del contrato de roles.

**Contexto / decisión.** Al redactar el `AGENTS.md` por roles, el prompt traía una estructura
backend alternativa (`modules/{domain,use-cases,controllers,dto}`). El usuario decidió
**mantener la estructura que ya tenían y que prefiere**: DDD por capas por bounded context
—`domain` / `application` (use-cases, services, **facades**, repositories, dtos) /
`infrastructure` (controllers, persistencia Prisma, module)— con la regla
`infrastructure → application → domain`, cruce entre dominios **solo vía facade** y
`dependency-cruiser` haciéndola cumplir.

**Resultado.** El rol *Backend Architect* del `AGENTS.md` quedó con la estructura real del
repo (no la simplificada); nada de la arquitectura backend cambió. Refuerza
[[01-arquitectura-ddd-por-capas]] y [[../meta/04-contrato-roles-agents]].
