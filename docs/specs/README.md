# docs/specs — specs de features

Specs de Ready, en markdown liviano (enfoque de spec-driven development, sin tooling),
adaptado a este monorepo de un solo repo. Los escribe el **Spec Planner**
(ver [`AGENTS.md`](../../AGENTS.md)); el `## Technical design` lo completa el Architect que
corresponda.

## Estructura

```
docs/specs/
├── templates/feature-spec.md   # plantilla base
├── active/                     # specs en curso (draft → in-progress)
└── completed/                  # specs entregados (shipped)
```

## Flujo

1. **Spec Planner** copia `templates/feature-spec.md` → `active/<kebab-name>.md` y llena el
   "qué" (problema, goals, contratos afectados, impacto, criterios, test plan, rollout).
2. **Architect** (Frontend/Backend/DevOps) completa el `## Technical design` para
   medium/large/risky.
3. **Implementation Agent** implementa, un PR por fila del plan de ejecución (ticket RDY-N).
4. Al entregar, el spec se mueve a `completed/`.

> **Sin tooling:** son archivos markdown, no OpenSpec ni otra CLI. Decisión deliberada para
> mantener el MVP simple (ver nota en el rol Spec Planner de `AGENTS.md`).
