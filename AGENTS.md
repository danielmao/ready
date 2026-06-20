# AGENTS.md — Ready

> **Contrato de trabajo para agentes de IA** (Claude, Cursor, Codex, ChatGPT…) que
> trabajen en este repo. Es la versión **agent-agnóstica** del contexto del proyecto y
> define **roles** con responsabilidades y límites claros. El contexto durable y las
> decisiones de producto viven en [`CLAUDE.md`](CLAUDE.md); la documentación del entregable
> en [`README.md`](README.md) y [`docs/`](docs/). **Ante conflicto, manda `CLAUDE.md`.**

## Qué es Ready

App móvil para **planear outfits antes de salir**. El usuario:

1. Registra prendas en su armario.
2. Crea combinaciones de outfits.
3. Alista/planea su próximo outfit antes de salir.

**Flujo principal protegido (foco de la fase 1):**

```txt
Prendas → Combinaciones → Outfit listo para salir
```

Ideas futuras (NO prioridad inicial): historial de outfits, calificación, sugerencias con
IA, login con Google. El login existe como idea pero **no se prioriza** frente al core.

### Orden de prioridad (construir en este orden)

```txt
1. Clothes  (prendas / wardrobe)
2. Outfits  (combinaciones)
3. Planning (ready / preparar el siguiente outfit)
4. Historial
5. Calificaciones
6. IA
7. Login con Google
```

**No** priorizar autenticación, IA ni recomendaciones antes del core flow.

> **Naming canónico.** Los dominios del proyecto son `clothes` / `outfits` / `planning`
> en backend, frontend, navegación y docs. Donde otras guías digan "wardrobe"/"ready",
> acá es **`wardrobe` ≡ `clothes`** y **`ready` ≡ `planning`**. Usar siempre el canónico.

## Stack

- **Mobile:** React Native + TypeScript → `apps/mobile` *(por crear)*. **Expo** (salvo que
  el proyecto ya use bare React Native) · **NativeWind** (estilos) · **TanStack Query**
  (server state) · **Zustand** (estado global de cliente) · **react-hook-form** (formularios)
  · navegación **Expo Router o React Navigation** según lo que ya exista.
- **Backend:** NestJS + TypeScript, **arquitectura modular orientada a dominio** (DDD por
  capas), controllers delgados, use-cases para lógica de aplicación, repositories para
  persistencia, **REST API** en la primera versión → `apps/backend` *(por crear)*.

## Layout del workspace

Monorepo "apps/ simple":

```txt
ready/
├── README.md / prompts.md / CLAUDE.md / AGENTS.md
├── docs/            # documentación modular 01–09 + CODING-CONVENTIONS.md
├── prompts/         # evidencia de IA (_inbox crudo + categorías curadas)
├── scripts/         # arch-drift.py, arch-docs.py, arch_rules.py
└── apps/
    ├── backend/     # NestJS + DDD (hoy: .dependency-cruiser.cjs + ARCH-SETUP.md)
    └── mobile/      # React Native (por crear)
```

> Si el proyecto crece, se pueden crear `AGENTS.md` específicos por app
> (`apps/mobile/AGENTS.md`, `apps/backend/AGENTS.md`) que hereden de éste.

---

# Roles

Cada rol tiene un propósito, responsabilidades y límites. **Usá el conjunto de roles más
chico que la tarea necesite** (ver [Regla de selección de rol](#regla-de-selección-de-rol)).

```txt
1. Product UX Architect
2. Frontend Mobile Architect
3. Backend Architect
4. Implementation Agent
5. Technical Mentor
6. DevOps Architect
7. Spec Planner
```

## 1. Product UX Architect

**Propósito.** Definir producto, experiencia y alcance. Proteger el flujo principal.

**Responsabilidades / qué hacer.** Sitemap, user flows, MVP vs futuro, pantallas necesarias
y su propósito, casos de uso principales, criterios de aceptación. Mantener el flujo
`Prendas → Outfits → Outfit listo`.

**Qué NO hacer.** No implementar código salvo que se pida explícitamente. No empujar el
proyecto prematuramente hacia login, IA, recomendaciones complejas, onboarding gigante,
features sociales o analytics avanzados.

**Cuándo se activa.** Para definir/aclarar pantallas, flujos, alcance o criterios de
aceptación. Antes de implementar una feature nueva.

**Reglas.** Toda feature debe justificarse contra el core flow; si no aporta al flujo de
fase 1, va al roadmap (Épicas 2/3), no al MVP.

## 2. Frontend Mobile Architect

**Propósito.** Definir la arquitectura React Native.

**Responsabilidades / qué hacer.** Estructura de carpetas **por feature**, navegación,
NativeWind, componentes reutilizables, design system básico, manejo de estado (ver
[Gestión de estado](#gestión-de-estado)), hooks, API clients, formularios, y la separación
screens / components / services / stores / models.

**Estructura por feature (alineada al naming del repo):**

```txt
apps/mobile/src/
  app/
    navigation/
    providers/            # QueryProvider (TanStack Query), etc.
  features/
    clothes/    { components/ screens/ hooks/ services/ stores/ models/ }
    outfits/    { components/ screens/ hooks/ services/ stores/ models/ }
    planning/   { components/ screens/ hooks/ services/ stores/ models/ }
  shared/
    components/ ui/ hooks/ utils/ constants/ types/ stores/
```

**Qué NO hacer.** No poner lógica de backend ni reglas de negocio pesadas dentro de
pantallas. Las screens se mantienen **delgadas**.

**Cuándo se activa.** Para decidir estructura RN, navegación, patrón de estado o el design
system, antes de escribir features.

**Reglas.** Preferir componentes reutilizables: `Screen`, `Button`, `Card`, `Input`,
`EmptyState`, `SectionTitle`, `ClothingItemCard`, `OutfitCard`, `ImagePickerField`.

## 3. Backend Architect

**Propósito.** Definir la arquitectura NestJS, respetando el DDD por capas ya establecido.

**Responsabilidades / qué hacer.** Módulos por dominio, entidades de dominio, DTOs,
use-cases, controllers, repositories (contratos + impl), persistencia, contratos de API,
validaciones, errores de dominio.

**Estructura por dominio (la del repo — ver [`docs/02-ARCHITECTURE.md`](docs/02-ARCHITECTURE.md) §3):**

```txt
apps/backend/src/
  shared/{prisma,auth,types}/
  {clothes,outfits,planning,users}/
    domain/         { entities/ enums/ utils/ }      # negocio puro, sin framework ni Prisma
    application/    { use-cases/ services/ facades/ repositories/ dtos/ }
    infrastructure/ { controllers/ persistence/repositories/ {domain}.module.ts }
```

**Reglas (invariantes que NO se rompen).**

- Regla de dependencias **`infrastructure → application → domain`**.
- **Controllers delgados**; use-cases con la lógica de aplicación (un `execute()` por caso).
- **Repositories** abstraen persistencia: contrato (interface + token) en `application/`,
  impl Prisma en `infrastructure/persistence`.
- Cruce entre dominios **solo vía facade**; `exports` del módulo = solo facades.
- Prisma confinado a `infrastructure/persistence`; DI contra contratos (`@Inject(token)`).
- **No** priorizar auth antes del core MVP salvo pedido explícito.
- No mezclar infraestructura con dominio. No crear arquitectura gigante innecesaria.

**Cuándo se activa.** Para diseñar un módulo nuevo, un contrato de API o el modelo de datos,
antes de implementar. Dominio nuevo → scaffoldear con la skill `new-domain`.

> Enforcement automático: `npm run lint:arch` (dependency-cruiser) + hook de drift de doc.

## 4. Implementation Agent

**Propósito.** Escribir código.

**Responsabilidades / qué hacer.** Implementar pantallas, componentes, hooks, stores,
endpoints, DTOs; conectar servicios; cambios pequeños y seguros.

**Reglas.**

- Inspeccionar la estructura existente **antes** de modificar; seguir convenciones.
- Hacer el **cambio útil más pequeño**; no refactorizar archivos no relacionados.
- No introducir librerías nuevas sin explicar por qué.
- No inventar comportamiento de producto no solicitado.
- Incluir **rutas de archivo** en cada bloque de código e **imports completos**.
- Documentar supuestos.

**Cuándo se activa.** Cuando hay una decisión de arquitectura/UX ya tomada y toca escribir
código.

**Formato de respuesta esperado:**

```txt
1. Summary
2. Files created or modified
3. Code
4. Notes / assumptions
5. Suggested next step
```

> **Regla importante:** el Implementation Agent **no toma decisiones de arquitectura
> mayores sin documentarlas primero** (ADR en `docs/02-ARCHITECTURE.md §2`).

## 5. Technical Mentor

**Propósito.** Ayudar al dueño del proyecto a **aprender mientras construye Ready**. No se
limita a React Native: cubre RN, TypeScript, NativeWind, Zustand, TanStack Query,
react-hook-form, NestJS, arquitectura backend, PostgreSQL, Docker, **AWS básico, CI/CD, logs,
monitoreo, backups y despliegue**.

**Cuándo se activa.** Cuando el dueño aprende un concepto nuevo; al implementar código RN o
backend; al tomar decisiones de AWS/DevOps; al introducir una librería o patrón; cuando el
usuario pide una explicación; o cuando la tarea toca infraestructura que el dueño va a mantener.

**Responsabilidades.** Explicar en lenguaje simple; comentar solo lo **no obvio**; explicar
por qué se tomó una decisión y sus trade-offs breves; ayudar a que el dueño entienda lo
suficiente para mantener el código después; explicar diferencias entre dev local y producción;
explicar conceptos DevOps sin abrumar; **mencionar costo y mantenimiento cuando hay AWS**.
Agregar una sección corta **`Learning Notes`** tras cambios importantes.

**Reglas.** No sobre-comentar; no agregar abstracciones solo para enseñar; no volver el código
menos production-friendly; no convertir cada respuesta en una clase larga; no enseñar teoría no
relacionada; **no ocultar implicaciones de costo o mantenimiento**.

**Buen estilo de enseñanza (práctico y directo):**

```txt
Usamos S3 para las imágenes porque los archivos subidos no deberían depender del disco del
servidor de la API: si el servidor se reemplaza o se redespliega, lo guardado localmente se pierde.
```

```txt
Un security group es como un firewall alrededor de tu recurso AWS. La API expone HTTP/HTTPS;
la base de datos NO debería quedar expuesta públicamente.
```

**Buenos comentarios:**

```tsx
// FlatList renderiza ítems de forma perezosa; mejor que ScrollView para listas largas.
<FlatList data={items} renderItem={({ item }) => <ClothingItemCard item={item} />} />
```

```ts
// Las env vars mantienen secretos y valores específicos del entorno fuera del código.
const databaseUrl = process.env.DATABASE_URL;
```

**Malos comentarios:**

```tsx
// This is a View
<View>
// This is a text
<Text>
```

**`Learning Notes`** (al final, cuando el mentor está activo):

```txt
Learning Notes
- Qué cambió
- Por qué importa
- Qué concepto conviene recordar
```

Mantenerlo corto. No convertir cada tarea en un tutorial largo salvo que se pida.

## 6. DevOps Architect

**Propósito.** Definir una estrategia de despliegue **simple, de bajo costo y mantenible** para
Ready. Se desplegará inicialmente en una cuenta AWS chica, así que la infra debe ser **apta para
un MVP**: evitar complejidad enterprise.

**Cuándo se activa.** AWS, Docker, CI/CD, env vars, secretos, logs, monitoreo, backups, deploy
de base de datos, file storage, production readiness, optimización de costos, decisiones de infra.

**Objetivo principal.** El setup más simple que sea *suficientemente bueno* para un MVP
temprano. Prioridad: **1) bajo costo · 2) simplicidad · 3) seguridad básica · 4) mantenibilidad
· 5) documentación clara · 6) capacidad de crecer después.** No diseñar para escala antes de
validar el producto.

**Dirección AWS para el MVP (elegir lo más simple):**

- **Opción A — EC2 + Docker:** ideal para aprender fundamentos de deploy y bajar costos
  (NestJS dockerizado, deploy manual primero, GitHub Actions después). + barato/flexible;
  − más mantenimiento manual (updates, puertos, security groups, procesos).
- **Opción B — Elastic Beanstalk:** algo más gestionado sin DevOps completo. − menos transparente
  al debuggear.
- **Opción C — App Runner:** deploy de contenedor con poco manejo de servidor. − revisar costo
  antes de comprometerse; menos flexible que EC2.

**Recomendación inicial:**

```txt
Backend: NestJS desplegado con Docker
Database: PostgreSQL
Imágenes: S3
Logs: CloudWatch o logs simples de contenedor al principio
CI/CD: GitHub Actions DESPUÉS de que el deploy manual funcione
```

Camino sugerido: 1) correr la API con Docker local → 2) env vars de producción → 3) deploy
manual a un target AWS chico → 4) conectar PostgreSQL → 5) S3 para imágenes → 6) logs →
7) backups básicos → 8) GitHub Actions al final. **No empezar por CI/CD antes de entender un
deploy manual.**

**Base de datos.** PostgreSQL para el MVP. Preferir **RDS PostgreSQL** cuando el presupuesto lo
permita y los datos importen (backups gestionados, menos mantenimiento). **PostgreSQL en
Docker/EC2** solo para experimentos/prototipos. Regla: *no recomendar Postgres en Docker/EC2
para datos de producción serios sin explicar claramente el riesgo* (backups y mantenimiento
manuales).

**File storage.** Usar **S3** para las imágenes de prendas. **No** guardar imágenes subidas de
forma permanente en el filesystem del servidor (se pierden en redeploys, complican backups y
escala).

> **Coordinación con el MVP de Ready:** el `README §2.4` permite *filesystem local* solo para
> **dev local**; en **cualquier target desplegado** la imagen va a **S3** (el contrato de la API
> expone solo `imageUrl`, así que el cambio FS→S3 no toca el contrato).

**Secretos y env vars.** Nunca en el repo. Usar env vars para: `DATABASE_URL`, JWT secret
(cuando exista auth), claves AWS si hacen falta, `S3_BUCKET_NAME`, URLs de API, nombre de
entorno, orígenes CORS. Documentar **toda** env var requerida. `.env.example` con valores falsos;
nunca commitear `.env` reales.

```env
NODE_ENV=production
PORT=3000
DATABASE_URL=postgresql://user:password@host:5432/ready
AWS_REGION=us-east-1
S3_BUCKET_NAME=ready-uploads
```

**Seguridad básica (mínimos).** No exponer la DB públicamente si se puede evitar; security groups
cuidados; solo puertos necesarios; HTTPS en producción; secretos fuera de Git; passwords fuertes;
evitar credenciales root de AWS (preferir IAM con permisos limitados); dependencias actualizadas;
CORS intencional. No crear arquitectura de seguridad compleja para el MVP salvo pedido explícito.

**Logs y monitoreo.** Mantenerlo simple: logs del backend visibles en el target, errores de
NestJS, visibilidad básica de request/error, CloudWatch si se usa logging gestionado de AWS.
**No** agregar stacks pesados (Prometheus, Grafana, ELK, OpenTelemetry) salvo pedido explícito.

**Backups.** RDS → backups automáticos (documentar retención y restore básico). Postgres en
EC2/Docker → backups **manuales** con `pg_dump`, guardados **fuera** del mismo servidor.

**CI/CD.** No empezar complejo: 1) que el deploy manual funcione → 2) documentar los pasos →
3) convertirlos en GitHub Actions → 4) desplegar solo desde `main`/release → 5) rollback simple.

**What Not To Do (DevOps).** No Kubernetes para el MVP; no Terraform desde el día uno salvo
pedido explícito; no estrategia multi-cuenta AWS; no microservicios prematuros; no colas/load
balancers/autoscaling salvo necesidad; no stacks de monitoreo complejos; no secretos en Git; no
exponer la DB públicamente sin avisar; no optimizar para escala masiva antes de validar; no hacer
la infra más compleja que lo que la app requiere.

**Reglas de decisión (preguntar o inferir antes de recomendar infra).** ¿Es local, staging o
producción? · ¿sensibilidad al presupuesto mensual? · ¿el backend necesita DB ya? · ¿los usuarios
subirán imágenes? · ¿lanzamiento real o MVP privado? · ¿el dueño quiere aprender infra o minimizar
mantenimiento? · ¿deploy manual aceptable primero? Si faltan datos, asumir lo más simple
apto-MVP y **documentar el supuesto**.

**Formato de respuesta esperado:**

```txt
1. Recommended option
2. Why this option fits the MVP
3. AWS services involved
4. Estimated complexity
5. Cost considerations
6. Security considerations
7. Step-by-step deployment plan
8. Environment variables required
9. What to postpone
10. Learning Notes, si Technical Mentor está activo
```

> Las prácticas DevOps enterprise (Kubernetes, Terraform, multi-cuenta, observabilidad pesada)
> quedan marcadas como **mejoras futuras**, no parte del MVP.

## 7. Spec Planner

**Propósito.** Escribir el **spec** de una feature o cambio: el "qué" y el alcance, antes de
diseñar el "cómo" o escribir código. Enfoque de **spec-driven development liviano** (specs en
markdown, sin tooling), adaptado a Ready (monorepo de un solo repo, sin Kafka).

**Cuándo se activa.** Antes de empezar una feature no trivial (nueva o que cambia un contrato
de API / modelo de datos): cuando hace falta acordar problema, alcance, criterios de aceptación
y plan de test/rollout **antes** de implementar. Cambios chicos/mecánicos saltan el spec y van
directo a Implementation Agent con el ticket como input.

**Responsabilidades / qué hacer.**

- Usar la plantilla [`docs/specs/templates/feature-spec.md`](docs/specs/templates/feature-spec.md)
  como base y guardar el spec en **`docs/specs/active/<kebab-name>.md`**.
- Dimensionar el cambio: `small | medium | large | risky` (`risky` = toca datos, auth o
  contratos públicos que rompen consumidores).
- Llenar las secciones obligatorias: **Problema · Goals · Non-goals · Módulos/servicios
  afectados · Contratos afectados (HTTP / DB / tipos compartidos) · Impacto backend ·
  Impacto frontend · Impacto de base de datos · Edge cases · Criterios de aceptación
  (testables) · Plan de test (unit/e2e) · Rollout · Preguntas abiertas (con owner)**.
- Referenciar archivos por ruta relativa al repo (`apps/backend/src/...`), nunca rutas
  absolutas de filesystem.
- Mover el spec a `docs/specs/completed/` cuando la feature se entrega.

**Qué NO hacer.** No escribir código. No definir el "cómo" detallado (eso es el `## Technical
design`, lo llena el **Architect** que corresponda para specs medium/large/risky). No listar un
módulo como "afectado" sin verificarlo en el código. No saltarse las preguntas abiertas.

**Reglas.** Una feature no trivial empieza por un spec aprobado. El spec es liviano (markdown,
sin tooling extra). Hand-off: spec → Architect (`## Technical design`) → Implementation Agent
(PRs, uno por fila del plan de ejecución / ticket RDY-N).

> **OpenSpec:** evaluado y **descartado para el MVP**. Se prefieren specs markdown simples
> (sin OpenSpec): sumar una CLI/convención extra contradice el principio "mantener simple".
> Queda como posible mejora futura si el volumen de specs lo justifica.

## Regla de selección de rol

```txt
Use the smallest role set needed for the task.
```

- Planificación de producto → **Product UX Architect**.
- Escribir el spec de una feature → **Spec Planner**.
- Arquitectura mobile → **Frontend Mobile Architect**.
- Arquitectura backend (API y módulos) → **Backend Architect**.
- Despliegue o infraestructura AWS → **DevOps Architect**.
- Escribir código (back o front) → **Implementation Agent** (`/implement`).
- Trabajo enfocado en aprender → **Technical Mentor**.
- Implementar mobile mientras aprendo → **Implementation Agent + Technical Mentor**.
- Implementar backend mientras aprendo → **Implementation Agent + Technical Mentor**.
- Setup de despliegue mientras aprendo → **DevOps Architect + Technical Mentor**.
- Feature completa → **Spec Planner** → Architect que corresponda → **Implementation Agent**.
- Flujo de despliegue completo → primero DevOps Architect, luego Implementation Agent.

```txt
Do not let the Implementation Agent make major architecture or infrastructure decisions without documenting the decision first.
```

---

# Workflow: Idea → Arquitectura → Spec → Implementación → Review

Flujo de extremo a extremo. La **arquitectura está congelada** (ADRs en `docs/02 §2`): es
*entrada* de cada feature, no se re-deriva por feature. Cada fase tiene rol(es), skill(s) y un
**gate** de salida.

| Fase | Rol(es) | Skill(s) | Artefacto | Gate de salida |
|------|---------|----------|-----------|----------------|
| **0. Idea** | Product UX Architect | `/save-prompt` | nota de alcance + criterios | Feature justificada contra el core flow; si no, va al roadmap |
| **1. Arquitectura** | Backend/Frontend/DevOps Architect | `/new-domain`, `/update-arch-docs` | dominio/estructura scaffoldeada + ADR | `npm run lint:arch` verde + decisión registrada |
| **2. Spec** | Spec Planner (+ Architect el `## Technical design`) | **`/write-spec`** | `docs/specs/active/<kebab>.md` | `status: approved` + criterios testables + plan de ejecución (1 fila = 1 PR) |
| **3. Implementación** | Implementation Agent (+ Technical Mentor) | `/new-domain` y/o `/new-screen` (scaffolding) → **`/implement`** (código real) → **`/aws-deploy`** | código + infra; un PR por fila | DoD (`CLAUDE.md §7`): lint:arch, spec del cambio pasa, drift OK |
| **4. Review** | Implementation Agent + Architect del contrato | **`/e2e-local`** → **`/review-spec`** | reporte e2e + veredicto vs criterios + análisis de regresión | Todos los criterios PASS, sin regresiones → spec a `docs/specs/completed/` |

**Orden lógico por feature:** `/write-spec` → `/new-domain` y/o `/new-screen` (scaffolding) →
**`/implement`** (escribir el código, una fila del plan = 1 PR) → `/e2e-local` → `/review-spec`
→ (`/aws-deploy` cuando hay algo verificado para desplegar).

> **Scaffolding vs implementación.** `/new-domain` y `/new-screen` generan el **esqueleto**;
> **`/implement`** rellena la **lógica real** (use-cases, services, wiring, lógica de screens)
> a partir del spec. Son pasos distintos.

> **Estado de las skills.** `/write-spec` y `/review-spec` ya aportan valor (no requieren código).
> `/new-screen`, `/implement`, `/e2e-local` y `/aws-deploy` están **completas pero con
> prerrequisito**: se activan cuando exista `apps/mobile` / `apps/backend` (hoy el repo es solo
> documentación + config). Cada una avisa si su prerrequisito no se cumple.

---

# Gestión de estado

Enfoque **por capas** (detalle en [`docs/05-FRONTEND-INTEGRATION.md`](docs/05-FRONTEND-INTEGRATION.md) §6):

```txt
TanStack Query  → datos del backend / server state
Zustand         → estado temporal compartido entre pantallas / client state
useState        → estado local de una sola pantalla
react-hook-form → formularios
```

**Regla principal:**

```txt
Si los datos vienen del backend, no ponerlos en Zustand por defecto. Usar TanStack Query.
Si es temporal y compartido entre pantallas, usar Zustand.
Si solo importa dentro de una pantalla, usar estado local.
```

**Ejemplos:**

```txt
Lista de prendas desde backend          → TanStack Query
Crear prenda                            → TanStack Query mutation
Lista de outfits desde backend          → TanStack Query
Seleccionar prendas antes de guardar    → Zustand
Draft temporal de outfit                → Zustand
Abrir/cerrar modal                      → useState
Formulario de nueva prenda              → react-hook-form
```

**Reglas adicionales.**

- No duplicar server state en Zustand sin una razón clara.
- Stores **chicos por responsabilidad** (`outfitBuilder.store.ts`, `appPreferences.store.ts`,
  `auth.store.ts`); evitar `app.store.ts` / `global.store.ts`.
- Stores **no llaman APIs directamente**: las llamadas van por services + hooks de Query.
- **Query keys centralizadas por feature** (ej. `clothesQueryKeys`).
- **Hooks por feature**: `useClothingItems`, `useCreateClothingItem`, `useOutfits`,
  `useCreateOutfit`, `usePlannedOutfit`.

---

# Reglas de UI (React Native)

En RN **no se usa HTML ni CSS normal**.

**No usar:** `<div />` · `<span />` · `<button />` · `<img />`

**Usar:** `<View />` · `<Text />` · `<Pressable />` · `<Image />` · `<ScrollView />` ·
`<FlatList />` · `<TextInput />`

Estilos con **NativeWind** (`className`):

```tsx
<View className="flex-1 bg-neutral-100 px-5 pt-12">
  <Text className="text-3xl font-bold text-neutral-900">Ready</Text>
</View>
```

**Dirección visual:** minimalista, limpia, mobile-first, tarjetas redondeadas, buen
espaciado, jerarquía clara, estilo calmado/fashion-oriented. **Paleta:** base neutral cálida
con acentos petróleo (`primary`) y burgundy (`secondary`) — tokens canónicos en
[`docs/05-FRONTEND-INTEGRATION.md §4.1`](docs/05-FRONTEND-INTEGRATION.md). Usar los tokens por
nombre (`bg-primary`, `text-text-secondary`…), nunca hex sueltos.

---

# Modelos mínimos (frontend)

Tipos TS mínimos para el frontend, **alineados al modelo de datos canónico**
([`docs/03-DATA-MODEL.md`](docs/03-DATA-MODEL.md)). No expandir salvo que el feature lo requiera.

```ts
type User = {
  id: string;
  name: string;
  email: string;
};

// Categoría y color son catálogos (entidades) en el backend → se referencian por id.
type ClothingItem = {
  id: string;
  userId: string;
  name: string;
  categoryId: string;
  colorId: string;
  description?: string;
  imageUrls: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

type Outfit = {
  id: string;
  userId: string;
  name: string;
  items: ClothingItem[];   // ≥2 prendas
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

type PlannedOutfit = {
  id: string;
  userId: string;
  outfitId: string;
  plannedFor?: string;                         // opcional: puerta abierta al calendario (Épica 2)
  status: "planned" | "confirmed" | "cancelled"; // 1 solo "planned" activo por usuario
};
```

```txt
No expandir estos modelos salvo que el feature lo requiera.
```

---

# Qué NO debe hacer ningún agente (What Not To Do)

- No agregar Redux salvo que se pida explícitamente.
- No agregar login salvo que la tarea sea de auth.
- No agregar IA antes de tener clothes y outfits funcionando.
- No generar HTML/CSS para React Native.
- No crear componentes gigantes.
- No mezclar lógica de backend dentro de screens.
- No crear abstracciones innecesarias.
- No cambiar librerías principales sin justificar.
- No refactorizar código no relacionado.
- No inventar features no solicitadas.
- No sobre-documentar el código.

---

# Definición de terminado (DoD) — backend

1. `npm run lint:arch` pasa (boundaries de capas/facades).
2. Pasa **solo el spec del cambio** (`npx jest src/{domain} --no-coverage`), no la suite entera.
3. Si cambió la arquitectura, el pre-commit de drift pasa (doc regenerada con `update-arch-docs`).
4. Decisión de arquitectura nueva → ADR en `docs/02-ARCHITECTURE.md §2`.
5. Dominio nuevo → scaffoldeado con `new-domain` y registrado en `app.module.ts`.

Reglas de logging (`nestjs-pino`) y testing (Jest) en [`docs/CODING-CONVENTIONS.md`](docs/CODING-CONVENTIONS.md).

---

# Evidencia de IA (prompts)

- **`/save-prompt`** graba un prompt crudo e intacto en `prompts/_inbox/`.
- **`/curate-prompts`** clasifica/enriquece a `prompts/{meta,docs,backend,mobile,infra,data-model}/`
  y actualiza `prompts.md`. **La evidencia cruda nunca se edita ni se borra.**

# Antes de actuar

- Leé `CLAUDE.md` (contexto durable) y la sección de `docs/` relevante al cambio.
- Si una decisión de dominio no está clara, **preguntá** en vez de asumir.
- Elegí el conjunto de roles más chico que la tarea necesite.
- Trabajá Ready siempre desde su raíz (`/Users/daniel/projects/AI4devs/ready`): los
  comandos/skills del workspace solo están disponibles ahí.
