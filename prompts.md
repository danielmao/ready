## Índice

1. [Descripción general del producto](#1-descripción-general-del-producto)
2. [Arquitectura del sistema](#2-arquitectura-del-sistema)
3. [Modelo de datos](#3-modelo-de-datos)
4. [Especificación de la API](#4-especificación-de-la-api)
5. [Historias de usuario](#5-historias-de-usuario)
6. [Tickets de trabajo](#6-tickets-de-trabajo)
7. [Pull requests](#7-pull-requests)

> Registro curado de los prompts más relevantes usados para construir **Ready** (app
> para alistar outfits · React Native + NestJS). Los originales crudos viven en
> [`prompts/_inbox/`](prompts/_inbox/); aquí queda la versión clasificada y agrupada por
> sección del entregable. Ver [`prompts/README.md`](prompts/README.md) para el
> funcionamiento del sistema (`/save-prompt` + `/curate-prompts`).

---

## 1. Descripción general del producto

**Prompt 1:**
```
vamos a crear una aplicacion en react native y en nestjs como backend, entonces tendremos en esta carpeta nuestro workspace completo. aca pondras un claude.md y tomaras como referencia ese repo que te comparti y este https://github.com/LIDR-academy/AI4Devs-finalproject-Example2, como primer entregable haremos la documentacion de este proyecto. guarda las referencias o la estructura de referencias que necesites para que siempre podamos continuar desde cualquier sesión. Nuestro proyecto se llamara Ready, y es una aplicacion para alistar tus outfits. si tienes dudas puedes irme preguntando
```

**Prompt 2:**
```
Siguiendo esta estructura de proyecto deseado y las referencias que tienes, ayudame a armar la documentación para el entregable 1, preguntame cosas si necesitas aclarar funcionalidades o temas. La idea es construir el MVP, pero que también podamos dejar abierto a mas funcionalidades si alcanzamos.

[Adjunta una especificación extensa de "Ready - Estructura del Proyecto": sitemap (3 tabs Prendas/Outfits/Planear + stacks y modales), data models con orientación DDD (User, ClothingItem, Category, Color, Tag, Occasion, Outfit, OutfitItem, PlannedOutfit + OutfitHistory/OutfitRating futuros), navegación React Native, funcionalidades core vs futuras, estructura sugerida de front y back, APIs REST iniciales y referencias de apps de closet/outfit.]
```

**Prompt 3:**
```
antes de empezar quiero hacer unos ajustes. Hay que crear una carpeta prompts en donde vamos a poner los prompts mas relevantes que vamos usar para contruir este proyecto. para eso podemos configurar un hook que se dispare cuando estamos creando prompts, si es algo relevante para nuestra app, lo guarde como evidencia del uso de IA en este proyecto, si es necesario crear subcarpetas y reclacificarlos o enriquecer los prompts antes de usarlos y de guardarlos, este hook se encargara de esto, tambien de arreglar errores de redaccion o inconcistencias. por ejemplo este lo podemos guardar y probar
```

> Nota de evolución: el hook automático `UserPromptSubmit` descrito en el Prompt 3 se
> **eliminó** después para evitar ruido; la captura pasó a ser manual con `/save-prompt`
> (solo se graba lo marcado como importante) y la curación on-demand con `/curate-prompts`.

**Prompt 4:**
```
recuerdas los proyectos base? necesitamos igual el formato de readme.md y de prompts.md al de esos proyectos
```

> Intención: alinear `README.md` y `prompts.md` al **formato exacto** de la plantilla
> AI4Devs (`AI4Devs-finalproject-Example2`), no solo a una estructura parecida. Resultado:
> ambos archivos reescritos con el esqueleto de la plantilla (Índice numerado, `0.1–0.5`,
> subsecciones `### **N.N.**`, `prompts.md` agrupado por sección del README).

---

## 2. Arquitectura del Sistema

### **2.1. Diagrama de arquitectura:**

**Prompt 1:**
```
Quiero hacer una modificación a la arquitectura del backend.

Actuá como arquitecto de software. Tu tarea es diseñar y dejar scaffolded la arquitectura de un microservicio backend nuevo, aplicando Domain-Driven Design con una separación estricta en tres capas. No implementes lógica de negocio todavía: definí estructura, contratos, límites entre capas y wiring de dependencias. Donde falte una decisión de dominio, listala como pregunta abierta en vez de asumirla.

## Stack
- TypeScript + NestJS
- Prisma como ORM sobre PostgreSQL
- Jest para tests

## Principio rector
El código se organiza por bounded context (dominio), y dentro de cada dominio en tres capas:
- domain: el modelo de negocio puro. No sabe nada de frameworks, bases de datos ni transporte.
- application: los casos de uso y la lógica de aplicación. Orquesta el dominio. Define contratos (interfaces) de todo lo externo que necesita, pero no sabe cómo están implementados.
- infrastructure: los detalles técnicos. Implementa los contratos que pide application (base de datos vía Prisma, HTTP, clientes de terceros) y conecta todo (DI).

La regla de oro de dependencias: infrastructure → application → domain. Las flechas apuntan hacia adentro. domain no conoce a nadie; application no conoce infrastructure.

[Incluye además: estructura de carpetas obligatoria por dominio, reglas detalladas por capa (entidades planas, repositorios = solo interfaces + token de inyección, use-cases con un único execute(), services internos, facades como única API pública entre dominios), los invariantes de límites entre dominios (cruce solo vía facade, Prisma solo en infrastructure/persistence) y los entregables esperados, incluyendo una propuesta inicial de schema.prisma y una lista de decisiones abiertas.]
```

> Segunda versión de un prompt previo que asumía el stack de `ms-subscriptions`
> (TypeORM + Kafka), reescrita para el stack real de Ready (**Prisma + PostgreSQL**, sin
> eventos por ahora). Resultado: `docs/02-ARCHITECTURE.md` (§1, §3, §3 bis) + README §2.

**Prompt 2:**
```
no cambies la estructura del backend que ya teniamos. la que ya teniamos me gusta mas
```

> Decisión: rechazar la estructura backend simplificada que proponía el prompt del contrato
> de roles y **mantener la DDD por capas existente** (`domain`/`application` con facades y
> repositories/`infrastructure`). El rol *Backend Architect* del `AGENTS.md` quedó con la
> estructura real del repo.

### **2.2. Descripción de componentes principales:**

**Prompt 1:**
```
ten en cuenta esto Mobile App
React Native
TypeScript
Expo, unless the project already uses bare React Native
NativeWind for styling
React Navigation or Expo Router, depending on the existing project setup
Backend
NestJS
TypeScript
Domain-oriented structure
REST API in the first version
```

> Intención: precisar el stack móvil más allá de "React Native". Resultado: stack volcado a
> `CLAUDE.md §2`, `AGENTS.md`, `README.md §2.2` y `docs/02` (Expo · NativeWind · React
> Navigation/Expo Router · TanStack Query · Zustand · react-hook-form).

**Prompt 2:**
```
define el tema de la app con estos colores

export const theme = { colors: { primary: "#003B4A" /* petróleo */, secondary: "#6F2B3E" /* burgundy */, accent: "#D9C9CC", background: "#F8F5F0", surface: "#FFFFFF", border: "#D8D0C8", textPrimary: "#172126", ... success/warning/error/info ... } };
```

> Intención: fijar la identidad visual (base neutral cálida + acentos petróleo/burgundy).
> Resultado: design tokens canónicos en `docs/05-FRONTEND-INTEGRATION.md §4.1` (tabla
> token→hex→uso + mapeo a NativeWind `tailwind.config.js`); `AGENTS.md` (Reglas de UI)
> actualizado. Regla: usar tokens por nombre (`bg-primary`…), nunca hex sueltos.

### **2.3. Estructura de ficheros y manejo de estado (frontend):**

**Prompt 1:**
```
vamos a usar sus ## State Management
Use a layered state management approach. Do not put all application state in a global store.
1. Server State → TanStack Query (datos del backend; queries para leer, mutations para escribir).
2. Global Client State → Zustand (estado compartido entre pantallas: draft de outfit, prendas seleccionadas, preferencias, onboarding, auth futuro).
3. Local Screen State → useState/useReducer (modales, filtros temporales, preview de imagen).
4. Forms → react-hook-form.

[Incluye además: estructura recomendada por feature (app/providers, features/*/hooks·services·stores, shared/stores), reglas de Zustand (stores chicos por responsabilidad, sin app.store.ts gigante, no llamar APIs directo), reglas de TanStack Query (hooks por feature, query keys centralizadas), y la regla principal: si el dato viene del backend no va a Zustand por defecto.]
```

> Coordinación: el naming `wardrobe`/`ready` del prompt se mapeó al canónico
> `clothes`/`outfits`/`planning`; los filtros de una sola pantalla pasaron de Zustand a
> estado local. Resultado: nueva **§6 Gestión de estado** en `docs/05-FRONTEND-INTEGRATION.md`
> + tabla y árbol actualizados en `docs/02`.

### **2.4. Infraestructura y despliegue**

**Prompt 1:**
```
Crear un hook que detecte drift entre el código y la documentación de arquitectura.

Actuá como ingeniero de plataforma. Tu tarea es crear un hook de pre-commit para este repositorio que detecte cuándo un cambio afecta la arquitectura del proyecto pero la documentación de arquitectura NO fue actualizada en el mismo commit. El hook NO escribe documentación: solo detecta el desfasaje y bloquea el commit indicando qué hacer.

## Qué cuenta como "cambio de arquitectura"
- Se crea o elimina un dominio (carpeta bajo src/{domain}/).
- Se agrega, renombra o elimina un caso de uso (application/use-cases/).
- Se agrega, cambia o elimina una fachada (application/facades/).
- Se agrega o cambia un contrato de repositorio (application/repositories/) o su token.
- Se agrega o elimina un service, emitter o controller.
- Cambia el wiring de un módulo ({domain}.module.ts): nuevos providers/exports.
- Cambia el modelo de datos (schema.prisma).

## Comportamiento del hook
Se dispara en pre-commit sobre los archivos staged; si no hubo cambio de arquitectura sale en silencio; si lo hubo y la doc de arquitectura no fue tocada en el mismo commit, falla con un mensaje claro que nombra explícitamente la skill `update-arch-docs`. Debe ser determinista, rápido, no modificar nada y poder correrse en modo "check" para CI.

[Las reglas de "qué cuenta como cambio de arquitectura" deben coincidir exactamente con las que usa la skill update-arch-docs.]
```

> Resultado: hook `scripts/arch-drift.py` en `pre-commit` + skill `update-arch-docs`,
> referenciados en el README §2.4 (enforcement de arquitectura).

**Prompt 2:**
```
ayudame a añadir un devops y apliar un poco el mentor — Add DevOps Architect and Update Technical Mentor.

[Prompt extenso: agregar al AGENTS.md un rol DevOps Architect (deploy simple y barato para MVP en AWS: EC2+Docker / Beanstalk / App Runner; NestJS dockerizado + PostgreSQL + S3 + CloudWatch; CI/CD con GitHub Actions DESPUÉS del deploy manual; reglas de DB, secretos, seguridad básica, logs, backups; What Not To Do sin K8s/Terraform/multi-cuenta; formato de respuesta de 10 puntos) y ampliar el mentor de "React Native Mentor" a "Technical Mentor" (RN + backend + AWS/DevOps, con Learning Notes). Premisa: mantener todo simple, barato y entendible porque el dueño está aprendiendo.]
```

> Coordinación: la regla "imágenes en S3" del DevOps Architect se reconcilió con el `README
> §2.4` (filesystem local en MVP) → **filesystem solo en dev local; cualquier target
> desplegado → S3**. Resultado: `AGENTS.md` rol 5 *Technical Mentor* + rol 6 *DevOps Architect*.

**Prompt 3:**
```
que necesitas de aws aca?
```

> Intención: antes de ejecutar el primer deploy, inventariar lo mínimo de AWS (IAM no-root,
> key pair, región, autorización de costos) en vez de improvisar. Resultado: kickoff del deploy
> EC2 + Docker + Caddy; el paso a paso quedó como tutorial en `learnings/01-primer-deploy-aws.md`.

**Prompt 4:**
```
hice el primer punto. Sin embargo tengo una configuración de la empresa vammo, quisiera hacer una personal pero entonces puedes crear una skill para conectarte a ambas? una skill global? o cómo manejaría las dos cuentas? para conectarme a la personal puedo copiarte los keys en el .env y lo haces tú? o cómo me conectaría?
```

> Intención: convivir dos cuentas AWS (Vammo + personal) sin mezclarlas, y resolver dónde van
> los secretos. Resultado: **perfiles con nombre** (Vammo por SSO, personal con access keys en
> `~/.aws/credentials`), **secretos NUNCA en un `.env` del repo ni en el chat**, y skill global
> **`aws-account`** (espejo de `clone-repo`) que verifica la identidad antes de toda acción
> facturable. Ver `learnings/01-primer-deploy-aws.md §1.1`.

> Las subsecciones **2.5** (Seguridad) y **2.6** (Tests) se cubrieron dentro de los prompts
> anteriores; sus prompts dedicados se irán agregando al curar durante la implementación.

---

## 3. Modelo de Datos

El modelo de datos del MVP (entidades, agregados DDD y entidades futuras) se definió
dentro del **Prompt 2 de la sección 1** (especificación de la estructura del proyecto).
Los prompts dedicados al esquema Prisma se agregarán durante la implementación del
backend.

---

## 4. Especificación de la API

Los endpoints REST iniciales (clothes, outfits, planning) se definieron dentro del
**Prompt 2 de la sección 1**. Los prompts de detalle de contratos OpenAPI se agregarán
al implementar los controllers.

---

## 5. Historias de Usuario

_(Pendiente — se completará al generar las historias de usuario detalladas durante la
implementación.)_

---

## 6. Tickets de Trabajo

_(Pendiente — se completará al aterrizar los tickets de trabajo por sprint.)_

---

## 7. Pull Requests

**Prompt 1 — primer feature (armario / Clothes) end-to-end:**
```
utiliza las scripts para implementar el primer feature de ready. haz una rama mvp y de allí
haz la rama para el primer feature. La idea es que uses las skills de este proyecto para
escribir el plan para implementarlo con tdd para hacer pruebas de e2e levantando los servicios.
crea la bd, la entidad el contenedor docker para correr la bd, corre el pyecto y que quede listo
para conectarse. también crea el feature en fronted ... /loop si encuentras algun inconnveniente
solucionalo de acuerdo a las buenas practicas del proyecto, separa bien las responsabilidades
porque esta va aser las base para los proximos features. al final haz una analisis de regresion
y refactorización ... verifica que lo que hiciste en el front corresponde a lo que hiciste en el
backend. al final haz el deploy a aws del backend y documenta los servicios
```

> Intención: llevar el primer feature de producto de punta a punta usando el workflow de skills
> (spec → dominio → tests/e2e → mobile → review → deploy). Resultado: dominio `clothes` (DDD por
> capas, `ClothesFacade`, Prisma+Postgres en Docker, guard `@CurrentUser`), e2e HTTP (12 pasos
> PASS), mobile (lista + alta), deploy AWS (EC2: api+postgres+Caddy, migra/siembra al arrancar) y
> servicios documentados. **PR `feat/clothes-domain` → `mvp`.** Curado en
> [`prompts/backend/03-…`](prompts/backend/03-implementar-primer-feature-clothes-tdd-deploy.md).

**Prompt 2 — correr la app y verla funcionando:**
```
como corro la app y veo el resultado?
```

> Intención: levantar la app mobile en un dispositivo real. Destapó una cadena de
> incompatibilidades de versiones que se resolvió **subiendo el proyecto a Expo SDK 54** (RN 0.81
> / React 19), instalando **Watchman** (EMFILE) y apuntando la app al backend por IP LAN / AWS
> (no `localhost`). Resultado: app corriendo en el teléfono listando las prendas. Curado en
> [`prompts/mobile/04-…`](prompts/mobile/04-correr-la-app-y-upgrade-expo-sdk54.md).

**Prompt 3 — segundo feature (Outfits) end-to-end + PR + deploy:**
```
hacer que se puedan crear, modificar y eliminar outfits. crear pr y desplegar esta rama
(desde una rama que salga de entrega2, haciendo el flujo de trabajo propuesto)
```

> Intención: construir el **segundo dominio del MVP** de punta a punta con el workflow de skills
> (`/write-spec → /new-domain → e2e → /new-screen → /review-spec → PR → deploy`). Resultado:
> dominio `outfits` (DDD, consume `ClothesFacade`, expone `OutfitsFacade`, wiring `@Global`), sin
> migración (tablas ya existían), e2e local + en producción PASS, UI mobile con el patrón
> controller-hook. **PR #9 `feat/outfits-domain` → `feature-entrega2-dmtu`**, desplegado a AWS.
> Curado en [`prompts/backend/04-…`](prompts/backend/04-dominio-outfits-crud-pr-deploy.md).

**Prompt 4 — separar lógica de la vista (patrón controller-hook):**
```
veo que a veces sueles poner muucho codigo en la vista, mezclando la logica de visualizacion
con el html, puedes separar usando un hook como view controller o algo asi que haga ver el
codigo mas ordenado. Usa el arquitecto para definir y establecer esto. documentalo si lo haces
```

> Intención: ordenar el código mobile separando lógica de presentación con un hook tipo
> "view-controller", **definido por el arquitecto** y **documentado**. Resultado: convención
> **controller-hook** en `docs/CODING-CONVENTIONS.md §5` + ADRs en `docs/02 §2`; refactor testigo
> `ClothingItemForm → useClothingItemForm` y toda la feature `outfits` con el patrón. Curado en
> [`prompts/mobile/06-…`](prompts/mobile/06-patron-controller-hook.md). (La captura de foto por
> cámara/galería y la verificación contra la API pública quedaron en
> [`mobile/05`](prompts/mobile/05-foto-camara-o-galeria.md) e
> [`infra/05`](prompts/infra/05-probar-api-publica-deploy.md).)

---

## Meta — tooling y gobernanza de agentes

Prompts sobre el andamiaje del proyecto y cómo deben trabajar los agentes de IA (no mapean
a una sección del entregable, pero son evidencia del uso de IA).

**Prompt 1:**
```
crea el agents.md de este proyecto
```

> Resultado: `AGENTS.md` en la raíz — versión agent-agnóstica del contexto (qué es Ready,
> stack, arquitectura DDD, comandos de enforcement, DoD, evidencia de IA).

**Prompt 2:**
```
mira ayudame a añadir esto también # Prompt para crear AGENTS.md del proyecto Ready

Actúa como un AI Engineering Architect especializado en proyectos móviles con React Native, backend con NestJS y flujos de trabajo asistidos por agentes de IA. Necesito que crees un archivo AGENTS.md para mi proyecto Ready.

[Prompt extenso: define AGENTS.md como contrato de trabajo con 5 roles (Product UX Architect, Frontend Mobile Architect, Backend Architect, Implementation Agent, React Native Mentor) — cada uno con propósito / responsabilidades / qué no hacer / cuándo se activa / reglas; más secciones de gestión de estado, reglas de UI (primitivas RN + NativeWind), modelos mínimos, orden de prioridad (clothes→outfits→planning→…→login), Role Selection Rule y What Not To Do.]
```

> Coordinación: naming → canónico `clothes`/`outfits`/`planning`; estructura backend → la
> DDD por capas existente (no la simplificada del prompt, ver §2.1 Prompt 2); modelos
> mínimos alineados a `docs/03` (`PlannedOutfit.status` = `planned|confirmed|cancelled`).
> Resultado: `AGENTS.md` reescrito como contrato de roles completo.

**Prompt 3:**
```
necesito también añadir un spec planner para que escriba los specs, basate en [sistema interno de specs], considera añadir si quieres openspec al proyecto, si lo ves necesario, sino, está bien asi
```

> Intención: sumar un rol **Spec Planner** que escriba los specs (el "qué") antes de diseñar o
> codear, con enfoque spec-driven liviano en markdown. **OpenSpec evaluado y descartado** para
> el MVP (mantener simple). Resultado: `AGENTS.md` rol 7 *Spec Planner* + scaffolding
> `docs/specs/` (plantilla + `active/`/`completed/`). El nombre de la fuente interna se redactó
> a pedido del usuario.

**Prompt 4:**
```
entonces debemos hacer lo siguiente
1) crea la skill
2) haz el PR
3) haz una carpeta en el proyecto que se llame learnings y crea un tutorial con lo que hicimos acá, de cómo crear un primer despliegue en AWS.
4) toma los prompts más relevantes de la conversación, guárdalos y cúralos.
```

> Intención: tras dejar el backend desplegado, consolidar el trabajo en artefactos durables.
> Resultado: skill global `aws-account`, PR de la rama `feat/backend-first-deploy-health`,
> carpeta `learnings/` con el tutorial de primer deploy en AWS, y esta misma traza de prompts
> curada. Patrón del proyecto: convertir cada trabajo concreto en tooling + docs + evidencia.

---

## Conversación / evidencia completa

La evidencia cruda e intacta de cada prompt vive en [`prompts/_inbox/`](prompts/_inbox/)
y, una vez clasificada, en `prompts/{meta,docs,backend,mobile,infra,data-model}/`. El
sistema funciona así:

- **`/save-prompt`** — graba manualmente un prompt crudo como evidencia importante.
- **`/curate-prompts`** — clasifica, corrige y enriquece los crudos, y actualiza este
  `prompts.md`. **La evidencia cruda nunca se edita ni se borra.**

### **Categorías capturadas hasta ahora**

- 🧭 **Kickoff / producto** — definición de Ready, stack y entregable 1 (1 prompt).
- 📐 **Documentación / estructura** — especificación del proyecto, MVP y formato AI4Devs (2 prompts).
- 🏗️ **Arquitectura backend** — DDD por capas, contratos, boundaries, decisión de mantener la estructura, y la implementación de los features `clothes` y `outfits` con TDD/e2e/deploy (4 prompts).
- 📱 **Mobile** — stack móvil (Expo/NativeWind), gestión de estado por capas, tema/paleta, correr la app (Expo SDK 54), captura de foto (cámara/galería) y el patrón de presentación **controller-hook** (6 prompts).
- ☁️ **Infra / tooling** — hook de drift de arquitectura, DevOps Architect/Technical Mentor, prerequisitos y dos cuentas de AWS, y verificación contra la API pública desplegada (5 prompts).
- 🧰 **Meta** — sistema de captura de prompts + creación/contrato de roles + Spec Planner de `AGENTS.md` (4 prompts).
