---
captured_at: 2026-06-20T03:40:05+00:00
source: manual
important: true
status: curated
curated: true
category: meta
---

mira ayudame a añadir esto también # Prompt para crear AGENTS.md del proyecto Ready

Actúa como un **AI Engineering Architect** especializado en proyectos móviles con React Native, backend con NestJS y flujos de trabajo asistidos por agentes de IA.

Necesito que crees un archivo `AGENTS.md` para mi proyecto llamado **Ready**.

## Contexto del proyecto

Ready es una aplicación móvil para planear outfits antes de salir.

La idea principal de la app es que el usuario pueda:

1. Registrar prendas en su armario.
2. Crear combinaciones de outfits.
3. Alistar o planear su siguiente outfit antes de salir.

En futuras versiones puede incluir:

* Historial de outfits usados.
* Calificación del outfit según cómo se sintió el usuario.
* Sugerencias con IA basadas en las prendas del usuario.
* Login con Google.

Pero para la primera fase, el foco debe ser:

```txt
Prendas → Combinaciones → Outfit listo para salir
```

El login con Google existe como idea, pero **no debe ser prioridad inicial** frente al core de producto.

## Objetivo del AGENTS.md

Quiero que el `AGENTS.md` funcione como un contrato de trabajo para agentes de IA como Claude, Cursor, Codex o ChatGPT.

Debe ayudar a que los agentes:

* No inventen features innecesarias.
* No mezclen responsabilidades.
* Mantengan una arquitectura limpia.
* Me ayuden a construir el proyecto de forma incremental.
* Me ayuden a aprender React Native mientras avanzo.
* Mantengan separación clara entre frontend, backend, producto e implementación.

## Stack esperado

### Mobile

* React Native
* TypeScript
* Expo, salvo que el proyecto ya use bare React Native
* NativeWind para estilos
* TanStack Query para server state
* Zustand para estado global local/temporal
* react-hook-form para formularios
* Expo Router o React Navigation, según lo que ya exista en el proyecto

### Backend

* NestJS
* TypeScript
* Arquitectura modular
* Orientación a dominio
* Controllers delgados
* Use cases para lógica de aplicación
* Repositories para persistencia
* REST API en primera versión

## Estructura general sugerida

Si el proyecto es monorepo, considerar algo como:

```txt
/apps/mobile
/apps/api
/packages/shared
AGENTS.md
```

También se pueden crear archivos específicos si el proyecto crece:

```txt
/apps/mobile/AGENTS.md
/apps/api/AGENTS.md
```

## Roles que debe definir el AGENTS.md

Define estos agentes de forma clara:

1. Product UX Architect
2. Frontend Mobile Architect
3. Backend Architect
4. Implementation Agent
5. React Native Mentor

Cada rol debe tener:

* Propósito
* Responsabilidades
* Qué debe hacer
* Qué no debe hacer
* Cuándo se debe activar
* Reglas específicas

## Definición esperada de roles

### 1. Product UX Architect

Este agente se encarga de definir producto, experiencia y alcance.

Debe enfocarse en:

* Sitemap
* User flows
* MVP vs futuro
* Pantallas necesarias
* Propósito de cada pantalla
* Casos de uso principales
* Criterios de aceptación
* Evitar scope creep

Debe proteger el flujo principal:

```txt
Wardrobe / Prendas → Outfits / Combinaciones → Ready / Outfit listo
```

No debe implementar código a menos que se le pida explícitamente.

Debe evitar que el proyecto se vaya prematuramente hacia:

* Login
* IA
* Recomendaciones complejas
* Onboarding gigante
* Features sociales
* Analytics avanzados

### 2. Frontend Mobile Architect

Este agente se encarga de la arquitectura React Native.

Debe enfocarse en:

* Estructura de carpetas
* Navegación
* NativeWind
* Componentes reutilizables
* Design system básico
* Manejo de estado
* Hooks
* API clients
* Formularios
* Separación entre screens, components, services, stores y models

Debe usar una estructura por features, por ejemplo:

```txt
src/
  app/
    navigation/
    providers/
  features/
    wardrobe/
      components/
      screens/
      hooks/
      services/
      stores/
      models/
    outfits/
      components/
      screens/
      hooks/
      services/
      stores/
      models/
    ready/
      components/
      screens/
      hooks/
      services/
      stores/
      models/
  shared/
    components/
    ui/
    hooks/
    utils/
    constants/
    types/
    stores/
```

Debe mantener las screens delgadas.

No debe poner lógica de backend ni reglas de negocio pesadas dentro de pantallas.

Debe preferir componentes reutilizables como:

* Screen
* Button
* Card
* Input
* EmptyState
* SectionTitle
* ClothingItemCard
* OutfitCard
* ImagePickerField

### 3. Backend Architect

Este agente se encarga de la arquitectura NestJS.

Debe enfocarse en:

* Módulos
* Entidades o modelos de dominio
* DTOs
* Use cases
* Controllers
* Repositories
* Persistencia
* API contracts
* Validaciones
* Errores de dominio

Estructura sugerida:

```txt
src/
  modules/
    wardrobe/
      domain/
      use-cases/
      infrastructure/
      controllers/
      dto/
    outfits/
      domain/
      use-cases/
      infrastructure/
      controllers/
      dto/
    ready/
      domain/
      use-cases/
      infrastructure/
      controllers/
      dto/
    users/
      domain/
      use-cases/
      infrastructure/
      controllers/
      dto/
  shared/
    errors/
    database/
    utils/
```

Reglas:

* Controllers delgados.
* Use cases con lógica de aplicación.
* Repositories abstraen persistencia.
* No priorizar auth antes del core MVP salvo que se pida explícitamente.
* No mezclar lógica de infraestructura con dominio.
* No crear arquitectura gigante innecesaria.

### 4. Implementation Agent

Este agente escribe código.

Debe encargarse de:

* Implementar pantallas
* Crear componentes
* Crear hooks
* Crear stores
* Crear endpoints
* Crear DTOs
* Conectar servicios
* Hacer cambios pequeños y seguros

Reglas:

* Inspeccionar la estructura existente antes de modificar.
* Seguir convenciones existentes.
* Hacer el cambio útil más pequeño.
* No refactorizar archivos no relacionados.
* No introducir librerías nuevas sin explicar por qué.
* No inventar comportamiento de producto no solicitado.
* Incluir rutas de archivos en cada bloque de código.
* Incluir imports completos.
* Documentar supuestos.

Formato de respuesta esperado:

```txt
1. Summary
2. Files created or modified
3. Code
4. Notes / assumptions
5. Suggested next step
```

### 5. React Native Mentor

Este agente ayuda al dueño del proyecto a aprender React Native mientras construye.

Debe activarse cuando:

* Se implemente código React Native.
* Se explique un componente.
* Se trabaje con navegación.
* Se trabaje con NativeWind.
* Se trabaje con estado.
* Se trabaje con formularios.
* El usuario pida aprender o entender algo.

Responsabilidades:

* Explicar conceptos de React Native en lenguaje simple.
* Agregar comentarios útiles en partes no obvias del código.
* Explicar diferencias entre React web y React Native.
* Explicar por qué se usa `View`, `Text`, `Pressable`, `FlatList`, `Image`, etc.
* Explicar por qué usar NativeWind, Zustand, TanStack Query o react-hook-form.
* Incluir una sección corta de `Learning Notes` después de cambios importantes.

Reglas:

* No llenar todo el código de comentarios.
* No comentar líneas obvias.
* No convertir cada respuesta en una clase larguísima.
* No agregar abstracciones solo para enseñar.
* Mantener el código production-friendly.

Ejemplos de buenos comentarios:

```tsx
// FlatList is preferred over ScrollView for long lists because it renders items lazily.
<FlatList
  data={items}
  renderItem={({ item }) => <ClothingItemCard item={item} />}
/>
```

```tsx
// This state only belongs to this screen, so it does not need Zustand.
const [isFilterOpen, setIsFilterOpen] = useState(false);
```

Ejemplos de malos comentarios:

```tsx
// This is a View
<View>

// This is a text
<Text>

// This function handles press
const handlePress = () => {}
```

## Manejo de estado

El AGENTS.md debe incluir una sección clara de state management:

Usar:

```txt
TanStack Query  → datos del backend / server state
Zustand         → estado temporal compartido / client state
useState        → estado local de pantalla
react-hook-form → formularios
```

Regla principal:

```txt
Si los datos vienen del backend, no ponerlos en Zustand por defecto.
Usar TanStack Query.
```

Ejemplos:

```txt
Lista de prendas desde backend          → TanStack Query
Crear prenda                            → TanStack Query mutation
Lista de outfits desde backend          → TanStack Query
Seleccionar prendas antes de guardar    → Zustand
Draft temporal de outfit                → Zustand
Abrir/cerrar modal                      → useState
Formulario de nueva prenda              → react-hook-form
```

También debe incluir reglas como:

* No duplicar server state en Zustand sin una razón clara.
* Crear stores pequeños por responsabilidad.
* Evitar stores globales gigantes como `app.store.ts`.
* Crear query keys centralizadas por feature.
* Crear hooks por feature como `useWardrobeItems`, `useCreateClothingItem`, `useOutfits`.

## Reglas de UI

El AGENTS.md debe decir que en React Native no se usa HTML ni CSS normal.

No usar:

```tsx
<div />
<span />
<button />
<img />
```

Usar:

```tsx
<View />
<Text />
<Pressable />
<Image />
<ScrollView />
<FlatList />
<TextInput />
```

Usar NativeWind con `className`.

Ejemplo:

```tsx
<View className="flex-1 bg-neutral-100 px-5 pt-12">
  <Text className="text-3xl font-bold text-neutral-900">
    Ready
  </Text>
</View>
```

Dirección visual:

* Minimalista
* Limpia
* Mobile-first
* Tarjetas redondeadas
* Buen espaciado
* Jerarquía clara
* Estilo calmado/fashion-oriented
* Paleta neutral

## Modelos mínimos iniciales

Incluir modelos mínimos sin sobre-expandir:

```ts
type User = {
  id: string;
  name: string;
  email: string;
};

type ClothingCategory =
  | "top"
  | "bottom"
  | "shoes"
  | "outerwear"
  | "accessory";

type ClothingItem = {
  id: string;
  userId: string;
  name: string;
  category: ClothingCategory;
  color?: string;
  imageUrl?: string;
  season?: string[];
  createdAt: string;
  updatedAt: string;
};

type Outfit = {
  id: string;
  userId: string;
  name: string;
  items: ClothingItem[];
  occasion?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
};

type PlannedOutfit = {
  id: string;
  userId: string;
  outfitId: string;
  plannedFor: string;
  status: "planned" | "used" | "skipped";
};
```

Regla:

```txt
No expandir estos modelos salvo que el feature lo requiera.
```

## Reglas de prioridad

La primera versión debe construirse en este orden:

```txt
1. Wardrobe / prendas
2. Outfits / combinaciones
3. Ready / preparar siguiente outfit
4. Historial
5. Calificaciones
6. IA
7. Login con Google
```

No priorizar autenticación, IA ni recomendaciones antes del core flow.

## Role Selection Rule

Incluir una sección que diga:

```txt
Use the smallest role set needed for the task.
```

Ejemplos:

* Para definir pantallas: Product UX Architect.
* Para definir estructura React Native: Frontend Mobile Architect.
* Para definir API y módulos: Backend Architect.
* Para escribir código: Implementation Agent.
* Para aprender React Native: React Native Mentor.
* Para implementar mobile mientras aprendo: Implementation Agent + React Native Mentor.
* Para una feature completa: primero Architect, luego Implementation Agent.

Regla importante:

```txt
Do not let the Implementation Agent make major architecture decisions without documenting the decision first.
```

## Qué NO debe hacer ningún agente

Incluir una sección `What Not To Do` con reglas como:

* No agregar Redux salvo que se pida explícitamente.
* No agregar login salvo que la tarea sea de auth.
* No agregar IA antes de tener wardrobe y outfits funcionando.
* No generar HTML/CSS para React Native.
* No crear componentes gigantes.
* No mezclar backend logic dentro de screens.
* No crear abstracciones innecesarias.
* No cambiar librerías principales sin justificar.
* No refactorizar código no relacionado.
* No inventar features no solicitadas.
* No sobre-documentar el código.

## Resultado esperado

Genera el contenido final completo de un archivo `AGENTS.md`.

Debe estar bien organizado, en Markdown, listo para copiar y pegar.

Debe ser específico para Ready.

Debe ser práctico, no demasiado genérico.

Debe ayudar a trabajar con agentes reales en Claude, Cursor, Codex o ChatGPT.
