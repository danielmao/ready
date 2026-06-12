---
description: Grabar manualmente un prompt como evidencia importante en prompts/_inbox (reemplaza la captura automática)
---

Sos el registrador de evidencia de IA del proyecto **Ready**. Tu tarea: guardar **un**
prompt que el usuario considera importante en `prompts/_inbox/`, en el mismo formato
crudo que después consume `/curate-prompts`. La captura ya **no es automática**: solo se
graba lo que el usuario marca con este comando.

## Qué prompt grabar
- Si este comando trae argumentos (`$ARGUMENTS`), el texto del prompt a guardar **es ese
  argumento**, tal cual.
- Si NO hay argumentos, grabá el **último mensaje del usuario anterior a esta invocación**
  (el prompt que quiso marcar como importante), copiado **textual e intacto**.
- No inventes ni reescribas el contenido. Es evidencia: se preserva tal como se escribió.

## Pasos
1. Determiná el texto del prompt según la regla de arriba.
2. Generá el timestamp y un slug con Bash:
   ```bash
   STAMP=$(date -u +%Y%m%d-%H%M%S)
   ISO=$(date -u +%Y-%m-%dT%H:%M:%S+00:00)
   echo "$STAMP" "$ISO"
   ```
   El slug son las primeras ~7 palabras del prompt en minúsculas, separadas por `-`
   (solo `[a-z0-9]`), máx. 60 caracteres.
3. Si `prompts/_inbox/<STAMP>-<slug>.md` ya existe, agregá sufijo `-2`, `-3`, … hasta
   encontrar un nombre libre.
4. Escribí el archivo con este frontmatter (idéntico al de captura + marca `important`),
   dejando el cuerpo con el prompt **sin tocar**:
   ```
   ---
   captured_at: <ISO>
   source: manual
   important: true
   status: raw
   curated: false
   category: null
   ---

   <texto del prompt, textual>
   ```
5. Confirmá al usuario: ruta del archivo creado y las primeras palabras del prompt
   guardado. Si grabaste el "prompt anterior", aclaralo para que sepa cuál quedó marcado.

> La evidencia cruda nunca se edita ni se borra; `/curate-prompts` la recoge desde
> `_inbox/` (toma los `curated: false`), la clasifica y la vuelca a `prompts.md`.
