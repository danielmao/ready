---
category: docs
source_raw: _inbox/20260620-034001-recuerdas-los-proyectos-base-necesitamos-igual-el.md
captured_at: 2026-06-20T03:40:01+00:00
status: curated
---

# Alinear README.md y prompts.md al formato del repo de referencia AI4Devs

**Intención.** Que el `README.md` y el `prompts.md` de Ready sigan **exactamente el mismo
formato** que los proyectos base de AI4Devs (plantilla `AI4Devs-finalproject-Example2`),
no solo una estructura parecida.

**Contexto / decisión.** Se tomó el README y el prompts.md de la plantilla como molde
literal y se reescribió el contenido de Ready dentro de ese esqueleto: Índice numerado,
`§0 Ficha del proyecto` con las subsecciones `0.1–0.5` de la plantilla, subsecciones en
negrita `### **N.N. Título:**`, títulos en Title Case (*Arquitectura del Sistema*, *Modelo
de Datos*, *Historias de Usuario*, *Tickets de Trabajo*, *Pull Requests*), historias como
`### **Historia de Usuario N:**`, tickets con `#### Descripción / Requisitos / Criterios`,
y PRs como `### **Pull Request N:**`. El `prompts.md` pasó a agruparse **por sección del
README (1–7)** con bloques de código `**Prompt N:**`, subsecciones `2.x`, e Índice arriba.

**Resultado.** `README.md` y `prompts.md` reescritos con el formato de la plantilla,
preservando todo el contenido real de Ready. Se mantuvo la honestidad del entregable
(secciones sin prompts reales quedan marcadas como pendientes) y la convivencia con el
sistema `/save-prompt` + `/curate-prompts`.
