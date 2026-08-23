# Ready — Alistá tus outfits

> Proyecto final de **AI4Devs** (LIDR Academy). App móvil para **preparar con
> antelación la ropa que vas a usar**: armás un armario digital, combinás prendas en
> outfits reutilizables y dejás listo el outfit de tu próxima salida.

Este README es el **entregable 1 (documentación)**. La documentación ampliada y
modular vive en [`docs/`](docs/) (01–09). La evidencia de uso de IA está en
[`prompts.md`](prompts.md).

---

## Índice

0. [Ficha del proyecto](#0-ficha-del-proyecto)
1. [Descripción general del producto](#1-descripción-general-del-producto)
2. [Arquitectura del sistema](#2-arquitectura-del-sistema)
3. [Modelo de datos](#3-modelo-de-datos)
4. [Especificación de la API](#4-especificación-de-la-api)
5. [Historias de usuario](#5-historias-de-usuario)
6. [Tickets de trabajo](#6-tickets-de-trabajo)
7. [Pull requests](#7-pull-requests)

---

## 0. Ficha del proyecto

### **0.1. Tu nombre completo:**

Daniel Torres (`danielmao`)

### **0.2. Nombre del proyecto:**

Ready — app para alistar outfits.

### **0.3. Descripción breve del proyecto:**

App móvil + API backend para **preparar con antelación la ropa que vas a usar**. El
usuario digitaliza su armario, combina prendas en outfits reutilizables y **arma su semana**:
elige un outfit para cada día y lo revisa de un vistazo antes de salir. Proyecto final de
AI4Devs (LIDR Academy); stack **React Native + NestJS + PostgreSQL/Prisma**.

### **0.4. URL del proyecto:**

**API pública (desplegada en AWS):** https://32-195-76-205.nip.io/api/health

Endpoints navegables sin instalar nada:

| Recurso | URL |
|---------|-----|
| Health | https://32-195-76-205.nip.io/api/health |
| Catálogo de categorías | https://32-195-76-205.nip.io/api/clothes/categories |
| Armario (paginado) | https://32-195-76-205.nip.io/api/clothes |
| Outfits | https://32-195-76-205.nip.io/api/outfits |
| Plan de la semana | https://32-195-76-205.nip.io/api/planning/week |
| Plan de hoy | https://32-195-76-205.nip.io/api/planning |

**App Android:** [`ready-aws.apk`](ready-aws.apk) en la raíz del repo — build de release que
ya apunta a esa API, listo para instalar por sideload. No hay build de iOS porque distribuir
en iOS exige cuenta de Apple Developer.

> El backend corre en una instancia EC2 que se **apaga cuando no se usa** para no gastar
> crédito. Si los links no responden, está detenida: se prende con
> `.claude/skills/ready-deploy/run.sh start` (~1 min). Ver [§2.4](#24-infraestructura-y-despliegue).

### 0.5. URL o archivo comprimido del repositorio

https://github.com/danielmao/ready

### **Alcance del MVP (decisiones cerradas)**

| Decisión | Resolución para el MVP |
|----------|------------------------|
| **Planning** | **Plan semanal**: un outfit por día (lunes→domingo), navegable entre semanas. Un solo activo por (usuario, día). |
| **Sugerencias por clima/ocasión** | **Fuera del MVP** → roadmap (Épica 2/3). |
| **Autenticación** | ~~Diferida~~ → **implementada**: login con Google (OAuth 2.0 mediado por el backend) + JWT propio. |
| **Base de datos** | **PostgreSQL + Prisma**. |

> El diseño deja explícitamente **puertas abiertas** (calendario, historial, ratings,
> sugerencias con IA, auth multi-usuario) sin condicionar la arquitectura del MVP.
> Ver [§1.2](#12-características-y-funcionalidades-principales) y [`docs/01-PROJECT-OVERVIEW.md`](docs/01-PROJECT-OVERVIEW.md).

---

## 1. Descripción general del producto

### **1.1. Objetivo:**

**Ready resuelve la fricción de vestirse a las apuras.** En vez de improvisar cada
mañana frente al ropero, el usuario:

1. **Digitaliza su armario** — registra cada prenda con foto, categoría, color y ocasiones.
2. **Arma outfits reutilizables** — combina ≥2 prendas en conjuntos con nombre.
3. **Arma su semana** — elige qué se va a poner cada día y lo revisa de un vistazo
   antes de salir. Es la pantalla de entrada de la app.

**Para quién:** cualquier persona que quiera organizar su ropa y ahorrar tiempo/decisión
al vestirse. El MVP es de **uso personal** (un solo usuario por dispositivo).

**Valor diferencial:** simplicidad. No es una app de compras ni un asistente de IA
pesado; es un organizador rápido centrado en el acto de *alistar* el outfit.

### **1.2. Características y funcionalidades principales:**

#### Core del MVP (imprescindible)

| Funcionalidad | Descripción |
|---------------|-------------|
| Registrar prendas | Crear `ClothingItem` con nombre, categoría, color, ocasiones, tags y fotos. |
| Listar / filtrar prendas | Catálogo con filtro por categoría, color y ocasión. |
| Detalle de prenda | Fotos, datos completos y outfits que la usan. |
| Editar / archivar prenda | Modificar campos o marcar inactiva (sin borrado físico). |
| Crear outfits | Combinar ≥2 prendas (`OutfitItem`), con nombre, ocasiones y tags. |
| Listar / filtrar outfits | Catálogo con filtro por ocasión, tags y prendas incluidas. |
| Detalle de outfit | Preview del conjunto, lista de prendas y acción "planear". |
| Editar / archivar outfit | Cambiar datos, añadir/quitar prendas, archivar. |
| Planear la semana | Elegir un outfit para cada día (lunes→domingo); los días son independientes entre sí. |
| Ver el día planeado | Outfit del día + checklist de prendas antes de salir. |
| Cambiar / liberar un día | Reemplazar el outfit de un día (el anterior de ESE día se cancela) o dejarlo libre. |
| Navegar entre semanas | Ir a la semana anterior/siguiente y volver a la actual. |
| **Login con Google** | Ingreso con la cuenta de Google; la sesión sobrevive a cerrar la app. Cada usuario ve su propio armario. |

#### Importantes pero no bloqueantes (MVP si alcanza el tiempo)

- Búsqueda avanzada de prendas y outfits.
- Tags dinámicos creados por el usuario.
- Ocasiones propias (además del catálogo predefinido).
- Múltiples fotos por prenda.
- Filtros combinados.

#### Roadmap — puertas abiertas (NO en v1)

| Funcionalidad | Épica |
|---------------|-------|
| Calendario de outfits por fecha (vista semanal/mensual) | Épica 2 |
| Historial de outfits usados (`OutfitHistory`) | Épica 2 |
| Calificación de outfits (`OutfitRating`) | Épica 2 |
| Recordatorios / notificaciones | Épica 2 |
| Sugerencias por ocasión | Épica 2 |
| Sugerencias con IA y por clima (API externa) | Épica 3 |

> El **modelo de datos del MVP ya contempla estas extensiones** (campos opcionales,
> entidades futuras documentadas) para no requerir migraciones disruptivas.

### **1.3. Diseño y experiencia de usuario:**

La app se organiza en **4 tabs** (bottom tabs) — **Home · Armario · Outfits · Perfil**, según el diseño
aprobado (Claude Design `Ready.dc`). **Home es la pantalla de entrada**: el plan de la semana,
donde se elige un día y se le asigna un outfit. Los detalles/altas/ediciones se apilan en el stack raíz
sobre los tabs. El stack raíz actúa además de **gate de sesión**: sin login muestra `Login`;
con sesión, los tabs. *(Los stacks de Settings/Search son roadmap — Épica 2.)*

```mermaid
graph TD
    Root[RootNavigator · gate de sesión] -->|sin sesión| LG[LoginScreen · Google]
    Root -->|con sesión| Tabs[MainTabs]
    Tabs --> T0[Tab Home]
    Tabs --> T1[Tab Armario]
    Tabs --> T2[Tab Outfits]
    Tabs --> T4[Tab Perfil]

    T0 --> WP[WeekPlanScreen · la semana]
    T1 --> CL[ClothesListScreen]
    T2 --> OL[OutfitsListScreen]
    T4 --> PR[ProfileScreen · cuenta + cerrar sesión]

    Root -. stack .-> CD[ClothingDetailScreen]
    Root -. modal .-> CC[Add/Edit ClothingItem]
    Root -. stack .-> OD[OutfitDetailScreen]
    Root -. modal .-> OC[Add/Edit Outfit]
    Root -. modal .-> PP["PlanPickerScreen · elegir outfit de un día"]
```

**Flujos principales:**

| Flujo | Pantallas |
|-------|-----------|
| Ingresar | Login → *navegador de Google* → vuelve por deep link → MainTabs |
| Crear prenda | ClothesList → *AddClothingItem (modal)* → vuelve a la lista |
| Crear outfit | OutfitsList → *AddOutfit (modal)* → vuelve a la lista |
| Ver detalle | ClothesList/OutfitsList → Detail → *Edit (modal)* |
| Planear un día | Home → elegir día en la tira → *PlanPicker (modal)* → ese día queda con outfit |
| Recorrer la semana | Home → ‹ / › cambian de semana; "Hoy" vuelve a la actual |
| Cerrar sesión | Perfil → confirmación → vuelve a Login |

Detalle de cada pantalla (propósito, componentes, datos que consume/modifica) en
[`docs/05-FRONTEND-INTEGRATION.md`](docs/05-FRONTEND-INTEGRATION.md).

### **1.4. Instrucciones de instalación:**

#### Opción A — probar sin instalar nada (recomendado)

1. **La API ya está desplegada:** abrí https://32-195-76-205.nip.io/api/health en el navegador.
   Los demás endpoints navegables están en [§0.4](#04-url-del-proyecto).
2. **La app:** instalá [`ready-aws.apk`](ready-aws.apk) en un Android. Ya apunta a esa API;
   no hay que configurar nada. Android va a pedir permitir "instalar apps de origen
   desconocido" porque viene por sideload y no de Play Store.

#### Opción B — correr todo en local

Requisitos: Node 20+, Docker (Postgres) y Expo Go en el teléfono.

```bash
# 1. Clonar
git clone git@github-dnl:danielmao/ready.git && cd ready

# 2. Backend
cd apps/backend
cp .env.example .env            # configurar DATABASE_URL y, si querés login, las GOOGLE_*
docker compose -f compose.dev.yaml up -d postgres
npm install
npx prisma migrate dev          # crear esquema
npm run seed                    # catálogos (categorías, colores, ocasiones) + usuario del MVP
npm run start:dev               # API en http://localhost:3000

# 3. Mobile (en otra terminal)
cd ../mobile
npm install
npm run start                   # Metro / Expo Go
```

Sin credenciales de Google la API arranca igual: el login falla, pero **el resto de la app
funciona** porque las requests sin token caen al usuario del MVP (`AUTH_REQUIRED=false`).

> **Ojo con el login en local desde un teléfono:** Google sólo acepta redirect URIs `https://`
> —con `localhost` como única excepción—, y ese `localhost` es el del teléfono, no el de tu
> máquina. Para probar el login real desde un dispositivo hay que apuntar la app al backend
> desplegado: `EXPO_PUBLIC_API_URL=https://32-195-76-205.nip.io/api npm run start`.

#### Regenerar el APK

```bash
cd apps/mobile && npm run build:apk
```

Guía detallada (variables de entorno, troubleshooting, seeds): [`docs/08-INSTALLATION-GUIDE.md`](docs/08-INSTALLATION-GUIDE.md).

### **1.5. Login — cómo acceder al sistema**

Ready **no tiene usuario y contraseña**: el único método de ingreso es **iniciar sesión con
Google**. No hay credenciales que compartir, porque la app nunca ve ni almacena una contraseña
— eso es precisamente lo que resuelve OAuth.

#### Cómo se ingresa

1. Abrir la app y tocar **"Continuar con Google"**.
2. Se abre el navegador del sistema con la pantalla de Google. Elegís tu cuenta.
3. Google devuelve a la app por deep link y ya estás adentro. **La sesión queda guardada**: la
   próxima vez que abras la app entrás directo, sin repetir el login.
4. Para salir: tab **Perfil → Cerrar sesión**.

#### Qué datos se piden y qué se guarda

Sólo los scopes `openid`, `email` y `profile`. Del `id_token` verificado se persisten **nombre,
email y URL de la foto**; nada más. No se pide acceso a Gmail, Drive, contactos ni ningún otro
dato. El token de Google se usa una sola vez —para saber quién sos— y se descarta: a partir de
ahí la app viaja con un JWT propio de Ready.

#### Para quien evalúe el proyecto

> ⚠️ El cliente OAuth está en modo **Testing** en Google Cloud, que limita el ingreso a los
> *test users* declarados. **Si vas a evaluar el proyecto y querés entrar con tu cuenta,
> pedime que te agregue como test user** (basta con el email de Google) y en un minuto queda
> habilitado. Sin eso, Google responde `access_denied` y la app muestra "No autorizaste el
> acceso con Google".

Como alternativa que **no requiere login**, la API pública expone los mismos datos que ve la
app y es navegable directo desde el browser — ver [§0.4](#04-url-del-proyecto). El backend
resuelve las requests sin token contra el usuario de demostración
(`AUTH_REQUIRED=false`), así que podés recorrer armario, outfits y planificación sin
autenticarte. La evidencia del flujo de login completo, con salida real de la API, está en
[`docs/evidence/deployment.md`](docs/evidence/deployment.md).

---

## 2. Arquitectura del Sistema

### **2.1. Diagrama de arquitectura:**

```mermaid
graph LR
    subgraph Device[Dispositivo móvil]
        RN[React Native App]
    end

    subgraph Server[Backend]
        API[NestJS REST API]
        subgraph Modules[Módulos DDD]
            MC[clothes]
            MO[outfits]
            MP[planning]
            MU[users]
        end
    end

    DB[(PostgreSQL)]
    FS[Almacenamiento de imágenes]

    RN -->|HTTPS / JSON| API
    API --> Modules
    Modules -->|Prisma| DB
    RN -.->|upload| FS
    API -.->|URLs| FS
```

**Patrón:** cliente móvil (RN) ↔ API REST (NestJS) ↔ PostgreSQL (Prisma). Arquitectura
**monolito modular** organizado por **bounded context**, cada uno con tres capas
(`domain` / `application` / `infrastructure`) y la regla de dependencias
`infra → application → domain`. Los dominios se comunican **solo vía facade**.

El usuario de cada request lo resuelve `CurrentUserGuard` a partir del **JWT** que Ready
emite al terminar el login con Google. La predicción del diseño original se cumplió: al
entrar la auth real **sólo cambió el guard** — ningún caso de uso ni controller se tocó,
porque todos ya recibían el `userId` como parámetro. Sin token, el guard cae al usuario
único del MVP mientras `AUTH_REQUIRED=false`, que es lo que mantiene navegables los links
de arriba y los e2e sin login.

**Por qué esta arquitectura:** permite testear el dominio sin framework ni base de datos,
aísla Prisma en una sola capa (cambiar de ORM no toca la lógica) y hace explícitos los
límites entre módulos. **Sacrificio:** más boilerplate por dominio (contratos + tokens de
DI + mappers) que un CRUD plano; se asume a cambio de mantenibilidad y de poder crecer a
los módulos del roadmap sin refactors disruptivos.

### **2.2. Descripción de componentes principales:**

| Componente | Responsabilidad | Tecnología |
|------------|-----------------|------------|
| **Mobile app** | UI, navegación, estado local, llamadas a la API | React Native + TS, Expo (salvo bare RN), NativeWind (estilos), React Navigation / Expo Router, React Query, React Hook Form + Zod |
| **infrastructure** | Entrada HTTP (controllers), impl Prisma de los contratos, wiring de Nest | NestJS, Prisma |
| **application** | Casos de uso (`execute()`), services internos, **facades** (API entre dominios), contratos de repositorio + token de DI | NestJS (DI) |
| **domain** | Entidades planas, enums, invariantes de negocio | TS puro (sin framework) |
| **Persistencia** | Esquema relacional, migraciones, queries | PostgreSQL + Prisma |
| **Imágenes** | Almacenar fotos de prendas | Filesystem local (MVP) → S3-compatible (futuro) |

### **2.3. Descripción de alto nivel del proyecto y estructura de ficheros**

Monorepo **"apps/ simple"** (sin tooling de monorepo extra):

```
ready/
├── README.md                 # este entregable
├── prompts.md                # evidencia de IA
├── docs/                     # documentación modular 01–09
└── apps/
    ├── mobile/               # React Native
    │   └── src/{screens,components,features,navigation,services,hooks,state,domain,utils}
    └── backend/              # NestJS + DDD por capas
        ├── prisma/           # schema.prisma (recurso compartido)
        └── src/
            ├── shared/{prisma,auth,types}            # infra transversal
            └── {clothes,outfits,planning,users}/
                  domain/{entities,enums,utils}
                  application/{repositories,use-cases,services,facades,dtos}
                  infrastructure/{controllers,persistence/repositories,*.module.ts}
```

Árbol completo de front y back en [`docs/02-ARCHITECTURE.md`](docs/02-ARCHITECTURE.md).

### **2.4. Infraestructura y despliegue**

**Desplegado y funcionando:** https://32-195-76-205.nip.io/api/health

- **Backend:** una instancia **EC2 `t3.micro`** (Amazon Linux 2023) con **Docker Compose**:
  `api` (NestJS sobre `node:20-slim`), `postgres:16-alpine` con volumen persistente, y
  **Caddy** como reverse proxy, que emite el certificado TLS por Let's Encrypt sin ALB.
  Ni la API ni la base se exponen a internet: sólo Caddy publica 80/443.
- **Dominio:** `nip.io` sobre la Elastic IP — resuelve a la IP sin registrar un dominio.
- **Migraciones y seed** corren al arrancar el contenedor (`docker-entrypoint.sh`), así que
  un deploy sobre base vacía queda operativo solo.
- **Imágenes:** bucket S3 **privado** (`ready-uploads`). El host de storage nunca se expone:
  la API lee los objetos con credenciales y los sirve por `GET /api/clothes/images/:key` con
  `Cache-Control` inmutable. La app reescala a 1080px antes de subir, así una foto de cámara
  de 3 MB viaja como ~250 KB.
- **Deploy:** un comando — `.claude/skills/ready-deploy/run.sh deploy <rama>` — que prende la
  instancia si hace falta, hace `git pull` de la rama, reescribe el `.env` del host con los
  secretos (S3 y Google OAuth, leídos de un `.env.deploy` local no versionado) y levanta el
  stack. Termina verificando el health público.
- **App móvil:** APK de release ([`ready-aws.apk`](ready-aws.apk)) construido con
  `expo prebuild` + Gradle, sin EAS. Regenerable con `npm run build:apk`.
- **Enforcement de arquitectura:** `dependency-cruiser` (`npm run lint:arch`) hace cumplir
  los boundaries de capas/facades; un hook de pre-commit detecta drift entre el código y la
  documentación de arquitectura.

**Costo:** la instancia se apaga cuando no se usa (`run.sh stop`). Por eso los links públicos
pueden no responder: no están caídos, están detenidos.

**Evidencia del sistema funcionando:** [`docs/evidence/deployment.md`](docs/evidence/deployment.md)
— salida real de la API pública (health, catálogos, armario con imágenes, y los cuatro caminos
del flujo de auth: redirect a Google con PKCE, rechazo de `redirect_uri` no permitido, 401 con
token inválido, y el perfil resultante de un login real con Google).

### **2.5. Seguridad**

| Aspecto | Implementado | Futuro |
|---------|--------------|--------|
| Autenticación | **Google OAuth 2.0 mediado por el backend** + JWT propio (`Bearer`) | `AUTH_REQUIRED=true` para cerrar el fallback anónimo |
| Sesión en el dispositivo | Token en `expo-secure-store` (Keychain / EncryptedSharedPreferences) | Refresh tokens y access token de minutos |
| Protección del flujo OAuth | PKCE S256, `state` firmado con TTL de 10 min, verificación de firma/emisor/**audiencia** del `id_token` | igual |
| Robo de sesión por redirect | **Lista blanca** de deep links: el callback vuelve con el token en la URL | igual |
| Autorización | Filtrado por el `userId` del token en cada query | igual |
| Validación de entrada | DTOs con `class-validator` en todos los endpoints | igual |
| Secretos | `client_secret`, `JWT_SECRET` y llaves S3 sólo en el `.env` del servidor; **nunca en el bundle de la app** | Secret manager |

Detalle y plan de testing de seguridad en [`docs/09-SECURITY-TESTING.md`](docs/09-SECURITY-TESTING.md).

### **2.6. Tests**

| Capa | Estrategia | Herramientas |
|------|-----------|--------------|
| Backend — unit | Casos de uso y reglas de dominio (mín. 2 prendas por outfit, 1 planned activo) | Jest |
| Backend — e2e | Flujos HTTP por módulo (crear prenda, crear outfit, planear) | Jest + Supertest |
| Mobile — unit | Componentes y hooks clave | Jest + React Native Testing Library |

Plan completo en [`docs/09-SECURITY-TESTING.md`](docs/09-SECURITY-TESTING.md).

---

## 3. Modelo de Datos

### **3.1. Diagrama del modelo de datos:**

Diagrama entidad-relación del **MVP** (entidades futuras marcadas como roadmap):

```mermaid
erDiagram
    User ||--o{ ClothingItem : tiene
    User ||--o{ Outfit : tiene
    User ||--o{ PlannedOutfit : tiene

    ClothingItem }o--|| Category : "es de"
    ClothingItem }o--|| Color : "tiene"
    ClothingItem }o--o{ Occasion : "para"
    ClothingItem }o--o{ Tag : "etiquetada"

    Outfit ||--|{ OutfitItem : "compone"
    OutfitItem }o--|| ClothingItem : "incluye"
    Outfit }o--o{ Occasion : "para"
    Outfit }o--o{ Tag : "etiquetado"

    PlannedOutfit }o--|| Outfit : "fija"
```

### **3.2. Descripción de entidades principales:**

| Entidad | Propósito | Campos clave | Reglas de negocio |
|---------|-----------|--------------|-------------------|
| **User** | Usuario (único en MVP) | id, email, name, photoUrl?, createdAt | Único; en MVP se siembra un registro fijo. |
| **ClothingItem** | Prenda | id, userId, name, categoryId, colorId, description?, imageUrls[], isActive | name obligatorio; categoría y color obligatorios; archivado lógico (`isActive`). |
| **Category** | Tipo de prenda (catálogo) | id, name, icon?, parentCategoryId? | Predefinido; jerarquía opcional. |
| **Color** | Color (catálogo) | id, name, hexCode | Predefinido; hexCode obligatorio. |
| **Tag** | Etiqueta flexible | id, name, userId? | Creada por el usuario; reutilizable. |
| **Occasion** | Contexto de uso | id, name, icon?, isGlobal | Catálogo global + propias del usuario. |
| **Outfit** | Conjunto de prendas | id, userId, name, isActive | name obligatorio; **mín. 2 OutfitItem**; archivado lógico. |
| **OutfitItem** | Relación outfit↔prenda | id, outfitId, clothingItemId, order | Única (outfitId, clothingItemId); `order` para orden visual. |
| **PlannedOutfit** | Outfit planeado para un día | id, userId, **plannedFor** (el día, medianoche UTC), outfitId, status | **1 sólo activo por (usuario, día)**; planear otro en ese día cancela el anterior en la misma transacción. Días distintos conviven → la semana. |

**Entidades futuras (documentadas, no implementadas):** `OutfitHistory`, `OutfitRating`.
`PlannedOutfit.plannedFor` —que en la primera versión era un punto de extensión sin usar— es
hoy **la clave del plan semanal**; sigue siendo la puerta abierta al **calendario completo** de
la Épica 2 (rangos arbitrarios, recurrencias).

Esquema Prisma, tablas pivote N:M y catálogos semilla en
[`docs/03-DATA-MODEL.md`](docs/03-DATA-MODEL.md).

---

## 4. Especificación de la API

API REST bajo `/api`. Autenticación por `Authorization: Bearer <jwt>`. Formato JSON. Paginación por
`page`/`limit` en listados.

### Los 3 endpoints principales (OpenAPI 3.0)

Uno por cada paso del core flow del producto: **registrar una prenda → combinarlas en un outfit
→ dejar fijado el próximo**. La especificación completa de todos los endpoints, incluidos los de
auth, está en [`docs/04-API-SPECIFICATION.md`](docs/04-API-SPECIFICATION.md).

```yaml
openapi: 3.0.3
info:
  title: Ready API
  version: 1.0.0
servers:
  - url: https://32-195-76-205.nip.io/api
security:
  - bearerAuth: []

paths:
  /clothes:
    post:
      summary: Registrar una prenda en el armario
      tags: [Clothes]
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required: [name, categoryId, colorId]
              properties:
                name:        { type: string, minLength: 1, maxLength: 120, example: "Camisa blanca de lino" }
                categoryId:  { type: string, format: uuid }
                colorId:     { type: string, format: uuid }
                description: { type: string, maxLength: 500, nullable: true }
                occasionIds: { type: array, items: { type: string, format: uuid }, uniqueItems: true }
                tagIds:      { type: array, items: { type: string, format: uuid }, uniqueItems: true }
                imageUrls:   { type: array, items: { type: string, format: uri } }
      responses:
        '201': { description: Prenda creada, content: { application/json: { schema: { $ref: '#/components/schemas/ClothingItem' } } } }
        '400': { description: Body inválido, o categoría/color/ocasión/tag inexistente }
        '401': { $ref: '#/components/responses/Unauthorized' }

  /outfits:
    post:
      summary: Crear un outfit combinando prendas
      description: >
        Exige **mínimo 2 prendas**: un outfit de una sola prenda no es un conjunto.
        Cada prenda se valida contra el armario del usuario antes de componer.
      tags: [Outfits]
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required: [name, outfitItems]
              properties:
                name: { type: string, minLength: 1, maxLength: 120, example: "Casual de oficina" }
                outfitItems:
                  type: array
                  minItems: 2
                  items:
                    type: object
                    required: [clothingItemId, order]
                    properties:
                      clothingItemId: { type: string, format: uuid }
                      order:          { type: integer, minimum: 1, description: "Posición en la que se muestra la prenda" }
                occasionIds: { type: array, items: { type: string, format: uuid }, uniqueItems: true }
                tagIds:      { type: array, items: { type: string, format: uuid }, uniqueItems: true }
      responses:
        '201': { description: Outfit creado }
        '400': { description: Menos de 2 prendas, o alguna prenda no existe / no es del usuario }
        '401': { $ref: '#/components/responses/Unauthorized' }

  /planning/week:
    get:
      summary: El plan de una semana (la home de la app)
      description: >
        Devuelve **siempre los 7 días** (lunes→domingo) de la semana que contiene `start`,
        con los días libres en `null`. `start` puede ser cualquier día de esa semana: el
        backend lo normaliza al lunes.
      tags: [Planning]
      parameters:
        - in: query
          name: start
          schema: { type: string, format: date, example: "2026-08-19" }
          description: "Cualquier día de la semana buscada. Ausente = la semana de hoy."
      responses:
        '200':
          description: La semana planeada
          content:
            application/json:
              schema: { $ref: '#/components/schemas/WeekPlan' }
        '400': { description: start no es una fecha válida }
        '401': { $ref: '#/components/responses/Unauthorized' }

  /planning:
    post:
      summary: Planear un outfit para un día
      description: >
        Sólo puede haber **un** `PlannedOutfit` activo por **(usuario, día)**. Planear otro
        en ese día cancela el anterior en la misma transacción; el resto de la semana no se
        toca. El cliente manda el día calculado con su **fecha local**.
      tags: [Planning]
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required: [outfitId, day]
              properties:
                outfitId: { type: string, format: uuid }
                day:
                  type: string
                  format: date
                  example: "2026-08-19"
                  description: "Día a planear, YYYY-MM-DD. Se persiste a medianoche UTC."
      responses:
        '201':
          description: Día planeado
          content:
            application/json:
              schema: { $ref: '#/components/schemas/DayPlan' }
        '400': { description: day ausente o con una fecha inválida }
        '404': { description: El outfit no existe, está archivado o no es del usuario }
        '401': { $ref: '#/components/responses/Unauthorized' }

  /planning/{day}:
    delete:
      summary: Liberar un día del plan
      tags: [Planning]
      parameters:
        - in: path
          name: day
          required: true
          schema: { type: string, format: date, example: "2026-08-19" }
      responses:
        '200': { description: "Día liberado — { success: true }" }
        '400': { description: day no es una fecha válida }
        '404': { description: Ese día ya estaba libre }
        '401': { $ref: '#/components/responses/Unauthorized' }

components:
  securitySchemes:
    bearerAuth: { type: http, scheme: bearer, bearerFormat: JWT }
  responses:
    Unauthorized:
      description: Token ausente (con AUTH_REQUIRED=true), inválido o expirado
  schemas:
    WeekPlan:
      type: object
      properties:
        weekStart: { type: string, format: date, example: "2026-08-17" }
        weekEnd:   { type: string, format: date, example: "2026-08-23" }
        days:
          type: array
          minItems: 7
          maxItems: 7
          items: { $ref: '#/components/schemas/DayPlan' }
    DayPlan:
      type: object
      description: >
        Un día del plan. `plannedOutfit` null = día libre. Con `plannedOutfit` presente pero
        `outfit` null, el outfit fue archivado: el día quedó huérfano y hay que re-elegir.
      properties:
        date:          { type: string, format: date, example: "2026-08-19" }
        plannedOutfit:
          type: object
          nullable: true
          properties:
            id:         { type: string, format: uuid }
            status:     { type: string, enum: [planned, confirmed, cancelled] }
            plannedFor: { type: string, format: date-time }
        outfit: { type: object, nullable: true }
        items:  { type: array, items: { type: object } }
    ClothingItem:
      type: object
      properties:
        id:          { type: string, format: uuid }
        name:        { type: string }
        description: { type: string, nullable: true }
        category:    { type: object, properties: { id: { type: string }, name: { type: string } } }
        color:       { type: object, properties: { id: { type: string }, name: { type: string }, hex: { type: string } } }
        imageUrls:   { type: array, items: { type: string, format: uri } }
        isActive:    { type: boolean }
```

<details>
<summary><b>Ejemplo de petición y respuesta</b> — crear un outfit</summary>

```http
POST /api/outfits HTTP/1.1
Host: 32-195-76-205.nip.io
Content-Type: application/json
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

{
  "name": "Casual de oficina",
  "outfitItems": [
    { "clothingItemId": "4cf7ef8f-b329-4dd2-8cce-2eabba8b3076", "order": 1 },
    { "clothingItemId": "45232f97-e4d4-4747-91a7-a09855296da6", "order": 2 }
  ],
  "occasionIds": ["a1f3c2d4-0000-4000-8000-000000000003"]
}
```

```json
HTTP/1.1 201 Created

{
  "id": "b7e21c90-5f3a-4d18-9c02-1e6ad4f77b21",
  "name": "Casual de oficina",
  "outfitItems": [
    { "clothingItemId": "4cf7ef8f-b329-4dd2-8cce-2eabba8b3076", "order": 1 },
    { "clothingItemId": "45232f97-e4d4-4747-91a7-a09855296da6", "order": 2 }
  ],
  "occasions": [{ "id": "a1f3c2d4-0000-4000-8000-000000000003", "name": "Trabajo" }],
  "tags": [],
  "isActive": true,
  "createdAt": "2026-08-12T00:41:18.220Z"
}
```

Con una sola prenda, la misma petición falla — la regla vive en el DTO, antes de tocar la base:

```json
HTTP/1.1 400 Bad Request

{
  "message": ["outfitItems must contain at least 2 elements"],
  "error": "Bad Request",
  "statusCode": 400
}
```

</details>

### Inventario completo de endpoints

### **Clothes**

| Método | Ruta | Propósito |
|--------|------|-----------|
| GET | `/api/clothes` | Listar prendas (filtros: categoryId, colorId, occasionId, tagId, search) |
| GET | `/api/clothes/:id` | Detalle de prenda |
| POST | `/api/clothes` | Crear prenda |
| PUT | `/api/clothes/:id` | Actualizar prenda |
| DELETE | `/api/clothes/:id` | Archivar prenda |
| GET | `/api/clothes/categories` | Catálogo de categorías |
| GET | `/api/clothes/colors` | Catálogo de colores |
| GET / POST | `/api/clothes/tags` | Listar / crear tags |
| GET / POST | `/api/clothes/occasions` | Listar / crear ocasiones |

### **Outfits**

| Método | Ruta | Propósito |
|--------|------|-----------|
| GET | `/api/outfits` | Listar outfits (filtros: occasionId, tagId, clothingId, search) |
| GET | `/api/outfits/:id` | Detalle con items |
| POST | `/api/outfits` | Crear outfit (≥2 items) |
| PUT | `/api/outfits/:id` | Actualizar outfit |
| DELETE | `/api/outfits/:id` | Archivar outfit |
| POST | `/api/outfits/:id/items` | Añadir prenda |
| DELETE | `/api/outfits/:id/items/:itemId` | Quitar prenda |

### **Planning**

| Método | Ruta | Propósito |
|--------|------|-----------|
| GET | `/api/planning/week?start=YYYY-MM-DD` | El plan de una semana: 7 días, libres incluidos |
| GET | `/api/planning?day=YYYY-MM-DD` | El plan de un día (sin `day`, hoy) |
| POST | `/api/planning` | Planear un outfit para un día (reemplaza lo que hubiera en ESE día) |
| PUT | `/api/planning/confirm` | Confirmar el día (el usuario sale con ese outfit) |
| DELETE | `/api/planning/:day` | Liberar ese día |

Esquemas de request/response, códigos de error y fragmentos OpenAPI en
[`docs/04-API-SPECIFICATION.md`](docs/04-API-SPECIFICATION.md).

---

## 5. Historias de Usuario

Listado priorizado (formato completo con criterios de aceptación en
[`docs/06-USER-STORIES.md`](docs/06-USER-STORIES.md)).

### **Historia de Usuario 1: Registrar una prenda**

> Como usuario quiero registrar una prenda con foto, categoría y color para tener mi
> armario digitalizado.

**Criterios de aceptación:**
- name, categoría y color son obligatorios.
- se pueden adjuntar 0 o más fotos.
- al guardar, la prenda aparece en el listado del armario.

### **Historia de Usuario 2: Crear un outfit**

> Como usuario quiero combinar ≥2 prendas en un outfit con nombre para reutilizarlo.

**Criterios de aceptación:**
- el outfit requiere un mínimo de 2 prendas.
- no se puede repetir la misma prenda dentro del mismo outfit.
- al guardar, el outfit aparece en el listado y puede planearse.

### **Historia de Usuario 3: Planear la semana**

> Como usuario quiero elegir un outfit para cada día de la semana, para dejar mi ropa
> resuelta con antelación y revisar la del día con un checklist antes de salir.

**Criterios de aceptación:**
- la pantalla de entrada muestra los **7 días** de la semana (lunes→domingo) y cuáles ya tienen outfit.
- se puede fijar un outfit distinto para cada día; los días son **independientes** entre sí.
- volver a elegir en un día **reemplaza sólo ese día** (el anterior pasa a `cancelled`).
- se puede liberar un día sin tocar el resto de la semana.
- se puede navegar a la semana anterior/siguiente y volver a la actual.
- el día seleccionado muestra el checklist de prendas de su outfit.

### **Otras historias (priorización)**

| ID | Título | Prioridad |
|----|--------|-----------|
| HU-02 | Ver y filtrar mi armario | Core |
| HU-06 | Editar / archivar prendas y outfits | Importante |
| HU-07 | Buscar prendas y outfits | Importante |
| HU-08 | Etiquetas y ocasiones propias | Importante |

---

## 6. Tickets de Trabajo

Backlog completo en [`docs/07-WORK-TICKETS.md`](docs/07-WORK-TICKETS.md). Selección
representativa:

| ID | Tipo | Título | HU | Estimación |
|----|------|--------|----|-----------:|
| RDY-1 | Infra | Scaffolding backend NestJS + Prisma + Docker Postgres | — | M |
| RDY-2 | Infra | Scaffolding mobile RN + navegación (tabs/stacks/modales) | — | M |
| RDY-3 | Backend | Módulo `clothes`: CRUD + catálogos | HU-01,02,08 | L |
| RDY-4 | Backend | Módulo `outfits`: CRUD + items (regla ≥2 prendas) | HU-03,06 | L |
| RDY-5 | Backend | Módulo `planning`: plan semanal (1 activo por día), confirm, liberar | HU-04,05 | M |
| RDY-6 | Mobile | Tab Prendas: lista + filtros + detalle + alta (modal) | HU-01,02 | L |
| RDY-9 | QA | Tests unit (dominio) + e2e (flujos HTTP) | — | M |

Tres tickets detallados (backend, frontend y base de datos):

### **Ticket 1 (Backend): Módulo `clothes` — CRUD + catálogos**

#### Descripción:
Implementar el bounded context `clothes` con la convención DDD por capas: dominio,
casos de uso, contratos de repositorio y persistencia Prisma. Expone el CRUD de prendas
y los catálogos asociados (categorías, colores, tags, ocasiones).

#### Requisitos funcionales:
- CRUD de `ClothingItem` (crear, listar con filtros, detalle, actualizar, archivar).
- Endpoints de catálogo: categorías, colores, tags (GET/POST), ocasiones (GET/POST).
- Archivado lógico (`isActive`), nunca borrado físico.

#### Requisitos técnicos:
- Tres capas (`domain`/`application`/`infrastructure`); cruce a otros dominios sólo vía facade.
- Prisma confinado a `infrastructure/persistence`; contratos inyectados por token de DI.
- DTOs validados con `class-validator`.

#### Criterios de aceptación:
- name/categoría/color obligatorios; rechazo con 400 si faltan.
- `npm run lint:arch` pasa (sin violaciones de capas/facades).
- Tests unit del dominio + e2e del flujo de creación en verde.

### **Ticket 2 (Frontend): Tab Prendas — lista, filtros, detalle y alta**

#### Descripción:
Construir el Tab "Prendas" en React Native: catálogo con filtros, detalle de prenda y
alta vía modal, consumiendo la API de `clothes`.

#### Requisitos funcionales:
- `ClothesListScreen` con filtro por categoría/color/ocasión y búsqueda.
- `ClothingDetailScreen` con fotos, datos y outfits relacionados.
- `CreateClothingScreen` (modal) con upload de fotos y selectores de catálogo.

#### Requisitos técnicos:
- React Navigation (tab + stack + modal); React Query para data fetching/caché.
- Formulario con React Hook Form + Zod; `react-native-image-picker` para fotos.

#### Criterios de aceptación:
- crear una prenda la deja visible en la lista sin recargar manualmente.
- los filtros refinan el listado en cliente/servidor sin recargar la pantalla.
- tests de componentes/hooks clave en verde (Jest + RN Testing Library).

### **Ticket 3 (Base de datos): Esquema Prisma, migraciones y seeds**

#### Descripción:
Definir el `schema.prisma` del MVP (entidades y pivotes N:M), generar la migración
inicial y sembrar catálogos + el usuario fijo single-user.

#### Requisitos funcionales:
- Modelos: User, ClothingItem, Category, Color, Tag, Occasion, Outfit, OutfitItem, PlannedOutfit.
- Pivotes N:M para prenda↔ocasión, prenda↔tag, outfit↔ocasión, outfit↔tag.
- Seed de categorías, colores, ocasiones globales y el `User` fijo del MVP.

#### Requisitos técnicos:
- `PlannedOutfit.plannedFor` opcional (punto de extensión al calendario, Épica 2).
- Restricción única `(outfitId, clothingItemId)` en `OutfitItem`.
- Archivado lógico (`isActive`) en `ClothingItem` y `Outfit`.

#### Criterios de aceptación:
- `npx prisma migrate dev` crea el esquema desde cero sin errores.
- `npm run seed` deja catálogos + user fijo listos para usar la API.
- el modelo soporta la regla "1 PlannedOutfit activo por usuario".

---

## 7. Pull Requests

Convención del repo: una rama por unidad de trabajo, PR con descripción enlazando el spec
que cierra, y `npm run lint:arch` + tests del dominio tocado en verde antes de mergear.

### **Pull Request 1 — [#3](https://github.com/danielmao/ready/pull/3): armario digital (dominio `clothes`)**

Primer dominio del MVP de punta a punta: backend DDD por capas (entidad `ClothingItem`,
catálogos, contratos de repositorio, CRUD con archivado lógico), UI mobile del tab Armario y
el primer deploy a AWS. Establece el patrón que copian los dominios siguientes.
Spec: [`docs/specs/active/clothes-domain.md`](docs/specs/active/clothes-domain.md).

### **Pull Request 2 — [#9](https://github.com/danielmao/ready/pull/9): dominio `outfits` (CRUD) + patrón controller-hook**

Segundo dominio. Consume `ClothesFacade` para validar que cada prenda existe, está activa y
es del usuario, y expone `OutfitsFacade` para `planning`. Resuelve el wiring cross-dominio con
módulos `@Global`, que es lo que permite respetar el boundary `cross-domain-only-via-facade`
sin importar módulos de infraestructura ajenos. Introduce el **patrón controller-hook** en
mobile: la lógica vive en `use<X>Controller` y las vistas quedan presentacionales.
Spec: [`docs/specs/active/outfits-domain.md`](docs/specs/active/outfits-domain.md).

### **Pull Request 3 — [#11](https://github.com/danielmao/ready/pull/11): entrega 2 — rediseño mobile + `planning` + `users`**

Cierra el core del MVP: dominio `planning` (un único `PlannedOutfit` activo; fijar otro cancela
el anterior de forma atómica), dominio `users` mínimo, el tab **Planear** y el rediseño de las
pantallas de outfits fiel al diseño aprobado.

### **Pull Request 4 — rama [`finalproject-dmtu`](https://github.com/danielmao/ready/tree/finalproject-dmtu): login con Google**

Dominio `auth` con OAuth 2.0 **mediado por el backend** (PKCE S256, `state`
firmado, verificación del `id_token`), `UsersFacade`, migración `users.googleId`, sesión
persistida en el dispositivo y APK de release apuntando al backend desplegado.
Spec: [`docs/specs/active/google-auth.md`](docs/specs/active/google-auth.md).

### **Pull Request 5 — rama [`finalproject-dmtu`](https://github.com/danielmao/ready/tree/finalproject-dmtu): plan semanal como home**

Convierte el "próximo outfit" único en un **plan por día de la semana** y lo asciende a
pantalla de entrada. El invariante pasa de "un activo por usuario" a "un activo por
(usuario, día)" —el mismo `plannedFor` que era un punto de extensión sin usar—, así que la
migración es sólo un backfill y un índice, sin tablas nuevas. Endpoint nuevo
`GET /api/planning/week` que devuelve los 7 días completos, y `WeekPlanScreen` con tira de
días navegable entre semanas.
Spec: [`docs/specs/active/weekly-plan-home.md`](docs/specs/active/weekly-plan-home.md).

---

> **Evidencia de uso de IA:** ver [`prompts.md`](prompts.md). Los prompts crudos se
> graban con `/save-prompt` en `prompts/_inbox/` y se curan con `/curate-prompts`.
