"""arch_rules — taxonomía compartida de la arquitectura (única fuente de verdad).

La importan DOS consumidores que deben coincidir exactamente:
  • scripts/arch-drift.py   — hook de pre-commit que DETECTA drift y bloquea.
  • scripts/arch-docs.py    — generador que la skill `update-arch-docs` usa para
                              REGENERAR la documentación.

Si cambia una ruta/capa acá, cambian ambos a la vez. No la dupliques en otro lado.

Arquitectura del backend (DDD por capas, por dominio):

    apps/backend/
    ├── prisma/schema.prisma                         → docs/03-DATA-MODEL.md
    └── src/{domain}/
        ├── domain/                                  (entidades/enums; cuerpo ≠ arquitectura)
        ├── application/
        │   ├── repositories/  (contrato + token)    → docs/02-ARCHITECTURE.md
        │   ├── use-cases/     (un execute())        → docs/02-ARCHITECTURE.md
        │   ├── services/                            → docs/02-ARCHITECTURE.md
        │   ├── emitters/                            → docs/02-ARCHITECTURE.md
        │   └── facades/       (API pública)         → docs/02-ARCHITECTURE.md
        └── infrastructure/
            ├── controllers/                         → docs/02-ARCHITECTURE.md
            └── {domain}.module.ts (wiring)          → docs/02-ARCHITECTURE.md
"""

from __future__ import annotations

# Raíces de código.
BACKEND_SRC = "apps/backend/src"
PRISMA_SCHEMA = "apps/backend/prisma/schema.prisma"

# Documentos destino (archivos planos del entregable AI4Devs; NO hay docs/architecture/).
DOC_ARCHITECTURE = "docs/02-ARCHITECTURE.md"
DOC_DATA_MODEL = "docs/03-DATA-MODEL.md"

# Carpetas bajo src/ que NO son dominios de negocio.
NON_DOMAIN_DIRS = {"shared"}

# Subrutas de cada capa, relativas a apps/backend/src/{domain}/.
LAYER_DIRS = {
    "use_cases": "application/use-cases",
    "facades": "application/facades",
    "repositories": "application/repositories",
    "services": "application/services",
    "emitters": "application/emitters",
    "controllers": "infrastructure/controllers",
}

# El archivo de wiring del dominio: src/{domain}/infrastructure/{domain}.module.ts
MODULE_SUFFIX = ".module.ts"
MODULE_DIR = "infrastructure"
