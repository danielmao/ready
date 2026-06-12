---
description: Scaffolds un bounded context completo del backend (DDD por capas) con la convención de Ready, listo para implementar.
---

# /new-domain

Genera el esqueleto de un dominio nuevo en `apps/backend/src/{domain}/` siguiendo
**exactamente** la arquitectura de `docs/02-ARCHITECTURE.md` (§3 y §3 bis). El objetivo
es que clothes, outfits, planning, users y cualquier dominio futuro sean estructuralmente
idénticos: la consistencia es el activo.

## Entrada
- Nombre del dominio en kebab/singular del negocio (ej. `clothes`, `outfits`, `planning`).
- `$ARGUMENTS` = nombre del dominio + (opcional) la entidad raíz y los dominios que
  consume vía facade. Si falta algo, preguntá antes de generar; no asumas el modelo.

## Qué generar (estructura obligatoria)

```
apps/backend/src/{domain}/
├── domain/
│   ├── entities/{entity}.entity.ts          # clase plana; constructor Partial+Object.assign
│   └── enums/                               # solo si el dominio los necesita
├── application/
│   ├── repositories/{entity}.repository.interface.ts   # interface + token SYMBOL
│   ├── use-cases/{verbo-entity}.use-case.ts            # @Injectable, UN solo execute()
│   ├── services/                            # crear solo si hay lógica reutilizable real
│   ├── facades/{domain}.facade.ts           # API pública del dominio
│   └── dtos/{verbo-entity}.dto.ts           # class-validator
└── infrastructure/
    ├── controllers/{domain}.controller.ts   # delgado; delega a use-cases
    ├── persistence/repositories/prisma-{entity}.repository.ts  # impl Prisma del contrato
    └── {domain}.module.ts                   # wiring: providers + exports (solo facades)
```

## Reglas que el código generado DEBE respetar
- **Entidad de dominio**: clase plana, sin decoradores ni imports de Prisma/Nest.
  `constructor(data: Partial<X> = {}) { Object.assign(this, data); }`
- **Contrato de repositorio**: `export interface {Entity}Repository { ... }` +
  `export const {ENTITY}_REPOSITORY = Symbol('{Entity}Repository');`. Tipos en entidades
  de dominio, **nunca** modelos de Prisma.
- **Use-case**: `@Injectable()`, único método público `execute(...)`. Inyecta el contrato
  con `@Inject({ENTITY}_REPOSITORY)`. **Nunca** importa de `infrastructure/`.
- **Service** (si aplica): `@Injectable()`, varios métodos chicos, interno (no se exporta).
  No crear services que solo reenvían al repositorio.
- **Facade**: `@Injectable()`, única cosa exportada del módulo. Firmas chicas y tipadas.
  **Nunca** importa de `infrastructure/`.
- **Repositorio Prisma**: implementa el contrato, único lugar del mapeo modelo Prisma ↔
  entidad de dominio. Es el único archivo del dominio autorizado a tocar `@prisma/client`
  o `PrismaService`.
- **Module**: `providers` registra use-cases, services, facade y bindea el contrato:
  `{ provide: {ENTITY}_REPOSITORY, useClass: Prisma{Entity}Repository }`. `exports`: **solo la facade**.
- **Cruce entre dominios**: si este dominio consume otro, inyectá la **facade** del otro
  (ej. `OutfitsFacade`), nunca sus repos/use-cases/tablas.
- **Tests**: un `.spec.ts` colocado junto al use-case principal (stub con el caso feliz).

## Después de generar (checklist que debés reportar)
1. Agregar el/los modelo(s) Prisma a `apps/backend/prisma/schema.prisma` (con `userId`,
   `isActive` y timestamps según la convención del data-model).
2. Importar `{Domain}Module` en `apps/backend/src/app.module.ts`.
3. Si hay cruce nuevo entre dominios, verificar que respeta el grafo acíclico de
   `docs/02-ARCHITECTURE.md §3 bis`.
4. Correr el enforcement de boundaries: `cd apps/backend && npm run lint:arch`.
5. Correr **solo** el spec del dominio nuevo (no la suite entera):
   `npx jest src/{domain} --no-coverage`.
6. La doc de arquitectura la regenera el hook/skill `update-arch-docs` — no la edites a mano.

No implementes la lógica de negocio completa: generá esqueletos compilables con TODOs
claros. Primero validamos estructura y contratos.
