---
category: meta
source_raw: _inbox/20260612-025704-antes-de-empezar-quiero-hacer-unos-ajustes.md
captured_at: 2026-06-12T02:57:04+00:00
status: curated
---

# Sistema de captura de prompts como evidencia de IA

**Intención.** Establecer, antes de empezar a documentar, una carpeta `prompts/`
que registre los prompts más relevantes usados para construir el proyecto, como
evidencia del uso de IA (requisito del entregable AI4Devs).

**Contexto / decisión.** Se pidió un hook que dispare al enviar un prompt y, si es
relevante para la app, lo guarde; además que pueda crear subcarpetas, reclasificar,
enriquecer y corregir errores de redacción/inconsistencias. Tras aclarar qué hace un
hook de forma determinista vs. qué requiere un modelo, se eligió el modo
**captura + curación on-demand**: el hook guarda el prompt crudo intacto en `_inbox/`
y la clasificación/corrección/enriquecimiento ocurre después vía `/curate-prompts`,
preservando siempre el original como evidencia.

**Evolución (estado actual).** La captura automática se **eliminó** a propósito: el hook
`UserPromptSubmit` (`capture-prompt.py`) generaba demasiado ruido al guardar *todos* los
prompts. Se reemplazó por un grabado **manual y on-demand** con el comando `/save-prompt`,
que guarda solo el prompt que el usuario marca como importante (con `important: true`),
en el mismo formato crudo de `_inbox/`. La curación con `/curate-prompts` se mantiene
igual. Resultado: la decisión de fondo (crudo intacto + curación on-demand) sigue vigente;
lo único que cambió es que la entrada al `_inbox/` ya no es automática sino deliberada.

## Prompt (versión corregida)

> Antes de empezar quiero hacer unos ajustes. Hay que crear una carpeta `prompts`
> donde pondremos los prompts más relevantes que usemos para construir este proyecto.
> Para eso podemos configurar un hook que se dispare cuando creamos prompts: si es algo
> relevante para nuestra app, que lo guarde como evidencia del uso de IA en este
> proyecto. Si es necesario, crear subcarpetas y reclasificarlos, o enriquecer los
> prompts antes de usarlos y guardarlos; este hook se encargará de esto, y también de
> arreglar errores de redacción o inconsistencias. Por ejemplo, este mismo lo podemos
> guardar y probar.
