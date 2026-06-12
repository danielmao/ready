---
captured_at: 2026-06-12T05:09:55+00:00
source: manual
important: true
status: raw
curated: false
category: null
---

Crear un hook que detecte drift entre el código y la documentación de arquitectura

  Actuá como ingeniero de plataforma. Tu tarea es **crear un hook de pre-commit**
  para este repositorio que detecte cuándo un cambio afecta la arquitectura del
  proyecto pero la documentación de arquitectura NO fue actualizada en el mismo
  commit. El hook NO escribe documentación: solo detecta el desfasaje y bloquea el
  commit indicando qué hacer.

  ## Por qué existe
  El proyecto sigue una arquitectura DDD en capas, organizada por dominio
  (bounded context). A medida que se desarrolla, la documentación de arquitectura
  tiende a quedar desactualizada. Este hook garantiza que ningún cambio de
  arquitectura entre al repo sin que la documentación se actualice primero.
  La actualización en sí la hace una skill separada llamada `update-arch-docs`
  (ver más abajo): este hook NO la reemplaza, la dispara avisándole al desarrollador.

  ## Qué cuenta como "cambio de arquitectura"
  Un cambio afecta la arquitectura cuando, entre los archivos staged del commit,
  ocurre alguna de estas cosas:
  - Se crea o elimina un **dominio** (carpeta nueva/eliminada bajo `src/{domain}/`).
  - Se agrega, renombra o elimina un **caso de uso** (`application/use-cases/`).
  - Se agrega, cambia o elimina una **fachada** (`application/facades/`) — la API
    pública de un dominio.
  - Se agrega o cambia un **contrato de repositorio**
    (`application/repositories/`) o su token de inyección.
  - Se agrega o elimina un **service**, **emitter** o **controller**.
  - Cambia el **wiring** de un módulo (`{domain}.module.ts`): nuevos `providers`
    o `exports`.
  - Cambia el **modelo de datos** (`schema.prisma`).

  Un cambio que solo toca el cuerpo de un método, sin alterar firmas públicas,
  estructura de carpetas ni dependencias, **no** cuenta como cambio de arquitectura.

  ## Comportamiento del hook
  1. Se dispara en `pre-commit`, sobre los archivos staged.
  2. Aplica las reglas de arriba para decidir si hubo cambio de arquitectura.
  3. Si NO hubo cambio de arquitectura → sale en silencio y deja pasar el commit.
  4. Si hubo cambio de arquitectura, revisa si en el mismo commit también se
     modificaron los documentos de `docs/architecture/`:
     - Si los docs SÍ fueron tocados → deja pasar el commit (asumimos que ya se
       actualizaron).
     - Si los docs NO fueron tocados → **falla el commit** con un mensaje claro:
       - qué cambió exactamente (qué dominio / fachada / contrato / modelo),
       - qué documento de `docs/architecture/` quedó desactualizado,
       - la instrucción concreta: "Ejecutá la skill `update-arch-docs` para
         regenerar la documentación y volvé a commitear."

  ## Restricciones
  - **Determinista y rápido**: si no hay cambios de arquitectura, debe salir casi
    instantáneamente.
  - **No modifica nada**: solo lee el staging area y, a lo sumo, falla con un mensaje.
  - No depende de servicios externos ni de red.
  - Debe poder ejecutarse manualmente en modo "check" (reporta sin bloquear), para
    poder usarlo también en CI.

  ## Qué tenés que entregar
  1. El script del hook y su instalación en `pre-commit` (y cómo se versiona en el repo).
  2. La lógica de detección (mapeo de rutas staged a las reglas de arquitectura).
  3. El mensaje de bloqueo, que debe nombrar explícitamente la skill `update-arch-docs`.
  4. Un comando para correrlo manualmente en modo check.
  5. Una nota con los supuestos/decisiones abiertas.

  Antes de implementar, proponé el diseño y esperá validación.

  > Las reglas de "qué cuenta como cambio de arquitectura" de este hook deben
  > coincidir exactamente con las que usa la skill `update-arch-docs`. Si cambia
  > una, debe cambiar la otra.
