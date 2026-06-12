---
captured_at: 2026-06-12T04:26:26.684237+00:00
session_id: 8f8c19af-c08a-4f98-b6ec-303b734f5ae6
cwd: /Users/daniel/projects/AI4devs/ready
status: raw
curated: false
category: null
---

Quiero hacer una modificación a la arquitectura del backend 

Actuá como arquitecto de software. Tu tarea es **diseñar y dejar scaffolded** la
  arquitectura de un microservicio backend nuevo, aplicando Domain-Driven Design
  con una separación estricta en tres capas. No implementes lógica de negocio
  todavía: definí estructura, contratos, límites entre capas y wiring de
  dependencias. Donde falte una decisión de dominio, listala como pregunta
  abierta en vez de asumirla.

  ## Contexto del proyecto
  - Propósito del servicio: <QUÉ HACE / QUÉ PROBLEMA RESUELVE>
  - Entidades de dominio principales: <Entidad1, Entidad2, ...>
  - Eventos que produce o consume: <eventos, o "ninguno por ahora">
  - Servicios externos de los que depende: <APIs de terceros, otros servicios, etc.>

  ## Stack
  - TypeScript + NestJS
  - Prisma como ORM sobre PostgreSQL
  - Kafka para eventos de dominio (si aplica)
  - Jest para tests

  ## Principio rector
  El código se organiza por **bounded context** (dominio), y dentro de cada
  dominio en tres capas con responsabilidades y dependencias bien separadas:

  - **domain**: el modelo de negocio puro. No sabe nada de frameworks, bases de
    datos ni transporte.
  - **application**: los casos de uso y la lógica de aplicación. Orquesta el
    dominio. Define contratos (interfaces) de todo lo externo que necesita, pero
    no sabe cómo están implementados.
  - **infrastructure**: los detalles técnicos. Implementa los contratos que pide
    application (base de datos vía Prisma, HTTP, clientes de terceros) y conecta
    todo (DI).

  La regla de oro de dependencias: **infrastructure → application → domain**.
  Las flechas apuntan hacia adentro. domain no conoce a nadie; application no
  conoce infrastructure.

  ## Estructura de carpetas por dominio (obligatoria)

      src/{domain}/
        domain/
          entities/        # clases planas del dominio, sin framework ni cliente de DB
          enums/
          utils/           # reglas/invariantes puras del dominio
        application/
          repositories/    # SOLO interfaces (contratos) + token de inyección
          use-cases/       # un caso de uso = una clase con UN único método execute()
          services/        # lógica reutilizable interna del dominio (varios métodos)
          facades/         # la API pública del dominio hacia otros dominios
          emitters/        # publicación de eventos de dominio
          dtos/
        infrastructure/
          controllers/     # entrada HTTP (controllers de Nest), delgados
          persistence/
            repositories/  # implementación de los contratos de application/repositories
                           # usando el cliente de Prisma; mapean modelo Prisma <-> entidad de dominio
          repositories/    # implementación de contratos hacia servicios externos (adapters)
          {domain}.module.ts  # wiring de Nest (providers + exports)

  El esquema de Prisma (`schema.prisma`) y el módulo que provee el cliente de
  Prisma se mantienen como recurso compartido de infraestructura, fuera de los
  dominios (p. ej. `prisma/schema.prisma` y un `PrismaModule` reutilizable).

  ## Reglas por capa

  ### domain/
  - Las entidades son **clases planas** que representan el negocio. Sin modelos de
    Prisma, sin imports de NestJS ni de infraestructura.
  - Patrón de constructor para las entidades:
    `constructor(data: Partial<X> = {}) { Object.assign(this, data); }`
  - Los enums y las invariantes/reglas puras de dominio viven acá.
  - Esta capa no importa de `application` ni de `infrastructure`.
  - Las entidades de dominio son independientes de los modelos generados por
    Prisma: el dominio nunca importa tipos del cliente de Prisma.

  ### application/repositories/ (contratos)
  - Acá van **solo interfaces**: `interface {Name}Repository { ... }`.
  - Cada contrato exporta además un token de inyección:
    `export const {NAME}_REPOSITORY = Symbol('{Name}Repository');`
  - Los parámetros y retornos usan **entidades de domain**, nunca modelos de
    Prisma.
  - La implementación concreta NO vive acá (vive en infrastructure).

  ### application/use-cases/
  - Una clase `@Injectable()` por caso de uso, con **un único método público
    `execute(...)`**.
  - Son los que orquestan: validan, llaman a repositorios/services/facades,
    emiten eventos, aplican el flujo de negocio.
  - Los contratos (repositorios y similares) se inyectan por token:
    `@Inject({NAME}_REPOSITORY)`. Las clases concretas internas se inyectan directo.
  - **Nunca** importan de `infrastructure/` ni del cliente de Prisma.

  ### application/services/
  - Clases `@Injectable()` con **lógica reutilizable compartida** entre varios
    use-cases del mismo dominio.
  - A diferencia de un use-case, **no** tienen un único `execute()`: exponen
    varios métodos chicos.
  - Crear un service solo cuando hay lógica real (validación, transformación,
    política, branching). No crear services que solo reenvían llamadas a un
    repositorio sin agregar nada.
  - Por defecto son **internos**: se registran en `providers` pero NO se exportan.
  - **Nunca** importan de `infrastructure/`.

  ### application/facades/
  - Una clase `@Injectable()` que es la **única API pública** del dominio hacia
    otros dominios.
  - Expone capabilities con firmas chicas y tipadas (entrada/salida explícitas).
  - Puede delegar directo a un repositorio (si es un passthrough simple) o a un
    service/use-case (si hay lógica).
  - **Nunca** importa de `infrastructure/`.
  - Es lo único que otro dominio tiene permitido consumir.

  ### infrastructure/
  - `controllers/`: capa de entrada (HTTP). Delgados, solo traducen request →
    llamada a un use-case → response.
  - `persistence/repositories/`: implementan los contratos definidos en
    `application/repositories` usando el cliente de Prisma. El mapeo entre el
    modelo de Prisma y la entidad de dominio ocurre únicamente acá: estas clases
    reciben los modelos de Prisma y devuelven entidades de dominio.
  - `repositories/`: implementan contratos hacia servicios externos. Toda
    integración con un servicio externo se hace mediante un adapter en esta capa.
  - `{domain}.module.ts`: el wiring de Nest.
    - `providers`: registra use-cases, services, facades, emitters y **bindea
      cada contrato a su implementación**:
      `{ provide: {NAME}_REPOSITORY, useClass: {ConcreteRepository} }`.
    - `exports`: **solo facades**. Nunca se exportan repositorios, services ni use-cases.

  ## Límites entre dominios (invariantes que no se rompen)
  - `domain` no importa de `application` ni de `infrastructure`.
  - `application` nunca importa de `infrastructure` ni del cliente de Prisma.
  - Un dominio se comunica con otro **únicamente a través de la facade** del otro
    dominio. Está prohibido importar repositorios, services o use-cases de otro dominio.
  - Ningún dominio accede a los datos de otro dominio directamente.
  - Toda llamada a un servicio externo pasa por un adapter/repository en
    `infrastructure/`. La lógica de negocio nunca se acopla a un SDK de terceros.
  - El cliente de Prisma solo se usa dentro de `infrastructure/persistence`; nunca
    se filtra hacia application o domain.
  - La inyección de dependencias se hace contra contratos (`@Inject(token)`), no
    contra clases concretas de infraestructura.

  ## Qué tenés que entregar
  1. El árbol de carpetas propuesto, con los dominios (bounded contexts)
     identificados a partir del contexto del proyecto.
  2. Por cada dominio: entidades de domain, contratos de repositorio, use-cases,
     services, facade y los endpoints/controllers que correspondan — solo firmas
     y skeletons, sin implementación.
  3. El `{domain}.module.ts` de cada dominio, con `providers` y `exports`.
  4. Una propuesta inicial de `schema.prisma` con los modelos que se desprenden de
     las entidades de dominio.
  5. Una lista de **decisiones abiertas**: todo lo que no quede claro del dominio,
     sin asumirlo.
  6. Una tabla o diagrama de dependencias entre dominios que demuestre que todos
     los cruces ocurren vía facades.

  No escribas implementación de negocio ni tests todavía: primero validamos esta
  arquitectura.
