---
category: meta
source_raw: _inbox/20260706-004933-no-subas-el-template-al-pr-elimina.md
captured_at: 2026-07-06T00:49:33+00:00
status: curated
---

# No subir los archivos del template de diseño al PR

**Intención.** El HTML del diseño (`Ready.dc.html` / bundle standalone) se había descargado a
`docs/specs/assets/` para poder leerlo; el usuario pidió **no** versionarlo en el PR y
**borrar** esos archivos.

**Contexto / resultado.** Se eliminó `docs/specs/assets/` (nunca llegó a trackearse). La
referencia visual del diseño quedó documentada **en texto** dentro de la spec
(`docs/specs/active/rediseno-outfits-mobile.md`), no como copia del HTML. Regla implícita: los
artefactos de diseño de terceros se consultan pero no se commitean; la evidencia va como
descripción propia.

Relacionado: [[08-diseno-outfits-y-tabs]].
