---
category: backend
source_raw: _inbox/20260612-042626-voy-a-modificar-el-prompt-por-este.md
captured_at: 2026-06-12T04:26:26+00:00
status: curated
---

# Arquitectura DDD por capas del backend (NestJS + Prisma)

**Intención.** Fijar el estilo arquitectónico del backend de Ready: un diseño
Domain-Driven Design con separación física estricta en tres capas por bounded context,
para que la documentación (y luego el código) lo refleje de forma consistente.

**Contexto / decisión.** El prompt llegó como un encargo de "arquitecto de software":
diseñar y dejar *scaffolded* la estructura (contratos, límites y wiring) **sin** lógica
de negocio, listando como preguntas abiertas todo lo que no estuviera claro del dominio.
Es la **segunda versión** de un prompt anterior que asumía el stack de `ms-subscriptions`
(TypeORM + Kafka); se reescribió para alinearlo con el stack real de Ready
(**Prisma + PostgreSQL**, Kafka solo "si aplica").

Reglas centrales que estableció y que se volcaron a `docs/02-ARCHITECTURE.md`:

- Organización por **bounded context**; dentro de cada uno, tres capas con la regla de
  dependencias **`infrastructure → application → domain`** (las flechas apuntan adentro).
- **`domain/`**: entidades como clases planas (`constructor(data: Partial<X> = {}) {
  Object.assign(this, data); }`), enums e invariantes puras. Sin framework ni Prisma.
- **`application/`**: `use-cases` (un solo `execute()`), `services` internos, `facades`
  (única API pública del dominio), `dtos` y **contratos de repositorio** (interface +
  token `SYMBOL`). Nunca importa de `infrastructure`.
- **`infrastructure/`**: `controllers` HTTP delgados, impl Prisma de los contratos en
  `persistence/repositories` (único lugar del mapeo modelo ↔ entidad), adapters externos
  y el `{domain}.module.ts` (wiring: `providers` bindea contrato→impl; `exports` **solo
  facades**).
- **Límites**: cruce entre dominios **solo vía facade**; nadie toca tablas ajenas; el
  cliente Prisma vive únicamente en `infrastructure/persistence`; DI contra contratos
  (`@Inject(token)`), no contra clases concretas.

**Resultado.** Se validó el diseño (5 bounded contexts; luego alineados a la nomenclatura
`clothes / outfits / planning / users`) y se reescribió `docs/02-ARCHITECTURE.md` (§1, §3,
§3 bis) + la sección 2 del README para reflejar las tres capas, la regla de dependencias
y el grafo de cruces vía facade. El prompt completo (template íntegro) queda en el crudo.
