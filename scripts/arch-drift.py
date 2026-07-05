#!/usr/bin/env python3
"""arch-drift — detector de desfasaje entre código y documentación de arquitectura.

Fuente de verdad de las reglas "qué cuenta como cambio de arquitectura". Lo usan
DOS consumidores y deben coincidir exactamente:

  1. El hook de pre-commit (.githooks/pre-commit) — modo BLOQUEO.
  2. La skill `update-arch-docs` — que regenera los docs cuando este detector marca drift.

Si cambian las reglas acá, hay que actualizar también la skill `update-arch-docs`.

Arquitectura del proyecto (DDD por capas, por dominio):

    apps/backend/
    ├── prisma/schema.prisma                      → docs/03-DATA-MODEL.md
    └── src/{domain}/
        ├── domain/                               (entidades/enums; cuerpo ≠ arquitectura)
        ├── application/
        │   ├── repositories/   (contrato + token) → docs/02-ARCHITECTURE.md
        │   ├── use-cases/                          → docs/02-ARCHITECTURE.md
        │   ├── services/                           → docs/02-ARCHITECTURE.md
        │   ├── emitters/                           → docs/02-ARCHITECTURE.md
        │   └── facades/        (API pública)       → docs/02-ARCHITECTURE.md
        └── infrastructure/
            ├── controllers/                        → docs/02-ARCHITECTURE.md
            └── {domain}.module.ts (wiring)         → docs/02-ARCHITECTURE.md

Modos:
  (sin flag) / --block   Falla (exit 1) si hay cambio de arquitectura sin doc actualizado.
                         Si no hay cambios de arquitectura → sale en silencio (exit 0).
  --check                Reporta y SIEMPRE sale 0 (para CI / inspección manual).

Determinista, sin red, sin dependencias externas (solo git + stdlib).
"""

from __future__ import annotations

import re
import subprocess
import sys

# Constantes de rutas/capas: ÚNICA fuente de verdad, compartida con scripts/arch-docs.py
# (el generador que usa la skill `update-arch-docs`). Ver scripts/arch_rules.py.
from arch_rules import (  # noqa: E402  (sys.path[0] == dir del script al ejecutarse)
    BACKEND_SRC,
    DOC_ARCHITECTURE,
    DOC_DATA_MODEL,
    LAYER_DIRS,
    MODULE_DIR,
    MODULE_SUFFIX,
    NON_DOMAIN_DIRS,
    PRISMA_SCHEMA,
)

# --------------------------------------------------------------------------- #
# Regex de rutas (capa por dominio), derivadas de arch_rules
# --------------------------------------------------------------------------- #
_D = rf"{BACKEND_SRC}/(?P<domain>[^/]+)"
RE_MODULE = re.compile(rf"{_D}/{MODULE_DIR}/[^/]+{re.escape(MODULE_SUFFIX)}$")
RE_USECASE = re.compile(rf"{_D}/{LAYER_DIRS['use_cases']}/")
RE_FACADE = re.compile(rf"{_D}/{LAYER_DIRS['facades']}/")
RE_REPO_CONTRACT = re.compile(rf"{_D}/{LAYER_DIRS['repositories']}/")
RE_SERVICE = re.compile(rf"{_D}/{LAYER_DIRS['services']}/")
RE_EMITTER = re.compile(rf"{_D}/{LAYER_DIRS['emitters']}/")
RE_CONTROLLER = re.compile(rf"{_D}/{LAYER_DIRS['controllers']}/")
RE_ANY_DOMAIN = re.compile(rf"{_D}/")

# --------------------------------------------------------------------------- #
# Regex de contenido (para casos modify-in-place: cuerpo de método NO cuenta)
# --------------------------------------------------------------------------- #
# Modificadores que pueden preceder a una firma pública.
_SIG_MODIFIERS = {
    "public", "private", "protected", "readonly", "abstract",
    "static", "async", "get", "set", "export", "declare",
}
# Palabras que arrancan una sentencia (cuerpo de método) — NUNCA una firma.
_STMT_KEYWORDS = {
    "if", "for", "while", "switch", "return", "await", "throw", "catch",
    "const", "let", "var", "new", "else", "do", "try", "this", "super",
    "break", "continue", "yield", "case", "default", "delete", "typeof",
    "void", "in", "of", "function",
}
_RE_LEADING_WORD = re.compile(r"([A-Za-z_$][\w$]*)")
_RE_SIG_TAIL = re.compile(r"[A-Za-z_$][\w$]*\s*\??\s*[\(<:]")

# Wiring de módulo: providers / exports / binding contrato→impl.
_RE_WIRING = re.compile(r"\b(providers|exports|useClass|useFactory|useValue|provide)\b")

# Prisma: model / enum / declaración de campo.
_RE_PRISMA = re.compile(r"^\s*(model|enum)\s+\w+|^\s+[A-Za-z_]\w*\s+[A-Za-z_]")


# --------------------------------------------------------------------------- #
# Git helpers
# --------------------------------------------------------------------------- #
def _git(args: list[str]) -> str:
    return subprocess.run(
        ["git", *args], capture_output=True, text=True, check=True
    ).stdout


def staged_changes() -> list[tuple[str, str]]:
    """Devuelve [(estado, path)] de los archivos staged. Para renames usa el path nuevo."""
    out = _git(["diff", "--cached", "--name-status"])
    changes: list[tuple[str, str]] = []
    for line in out.splitlines():
        if not line.strip():
            continue
        parts = line.split("\t")
        status = parts[0]
        if status[0] in ("R", "C") and len(parts) >= 3:
            changes.append((status[0], parts[2]))
        else:
            changes.append((status[0], parts[-1]))
    return changes


def _diff_lines(path: str) -> list[str]:
    """Líneas +/- (sin cabeceras) del diff staged de un archivo."""
    out = _git(["diff", "--cached", "-U0", "--", path])
    return [
        ln for ln in out.splitlines()
        if (ln.startswith("+") or ln.startswith("-"))
        and not ln.startswith("+++")
        and not ln.startswith("---")
    ]


# --------------------------------------------------------------------------- #
# Detección de contenido
# --------------------------------------------------------------------------- #
def _is_signature_line(diff_line: str) -> bool:
    """True si la línea (con prefijo +/-) declara una firma pública o un token de DI."""
    s = diff_line[1:].strip()
    if not s or s.startswith(("//", "*", "/*")):
        return False
    if "Symbol(" in s:  # token de inyección: export const X_REPOSITORY = Symbol(...)
        return True
    # Quitar modificadores de visibilidad/declaración.
    while True:
        m = _RE_LEADING_WORD.match(s)
        if m and m.group(1) in _SIG_MODIFIERS:
            s = s[m.end():].lstrip()
            continue
        break
    m = _RE_LEADING_WORD.match(s)
    if not m or m.group(1) in _STMT_KEYWORDS:
        return False
    # El identificador debe ir seguido de '(' (método), ':' (prop) o '<' (genérico).
    return bool(_RE_SIG_TAIL.match(s))


def _has_signature_change(path: str) -> bool:
    return any(_is_signature_line(ln) for ln in _diff_lines(path))


def _has_wiring_change(path: str) -> bool:
    return any(_RE_WIRING.search(ln) for ln in _diff_lines(path))


def _has_prisma_change(path: str) -> bool:
    return any(_RE_PRISMA.search(ln[1:]) for ln in _diff_lines(path))


def _domain(path: str) -> str:
    m = RE_ANY_DOMAIN.match(path)
    return m.group("domain") if m else "?"


# --------------------------------------------------------------------------- #
# Reglas de arquitectura
# --------------------------------------------------------------------------- #
_VERB = {"A": "agregado/a", "D": "eliminado/a", "R": "renombrado/a", "M": "modificado/a"}


def detect(changes: list[tuple[str, str]]) -> list[dict]:
    """Aplica las reglas y devuelve los hallazgos: [{desc, doc, path}]."""
    findings: list[dict] = []

    def add(desc: str, doc: str, path: str) -> None:
        findings.append({"desc": desc, "doc": doc, "path": path})

    for status, path in changes:
        # Los archivos de test no son arquitectura: se excluyen igual que en arch-docs.py
        # (que deriva 18 use-cases ignorando *.spec.ts/*.test.ts). Mantener ambos consistentes.
        if path.endswith((".spec.ts", ".test.ts")):
            continue

        dom = _domain(path)
        if dom in NON_DOMAIN_DIRS:
            # shared/ no es un dominio; el module.ts no aplica, pero schema sí (abajo).
            pass

        # 7. Modelo de datos.
        if path == PRISMA_SCHEMA:
            if status in ("A", "D") or (status == "M" and _has_prisma_change(path)):
                add(f"Modelo de datos {_VERB.get(status, status)} (schema.prisma)",
                    DOC_DATA_MODEL, path)
            continue

        if dom in NON_DOMAIN_DIRS or not RE_ANY_DOMAIN.match(path):
            continue

        # 1. Dominio / wiring de módulo (mismo archivo: {domain}.module.ts).
        if RE_MODULE.search(path):
            if status in ("A", "D"):
                add(f"Dominio '{dom}' {_VERB[status]} (module.ts)", DOC_ARCHITECTURE, path)
            elif status == "M" and _has_wiring_change(path):
                add(f"Wiring del módulo '{dom}' modificado (providers/exports)",
                    DOC_ARCHITECTURE, path)
            continue

        # 2. Casos de uso.
        if RE_USECASE.search(path):
            if status in ("A", "D", "R"):
                add(f"Caso de uso {_VERB[status]} en dominio '{dom}'", DOC_ARCHITECTURE, path)
            continue

        # 3. Fachada (API pública del dominio).
        if RE_FACADE.search(path):
            if status in ("A", "D", "R"):
                add(f"Fachada {_VERB[status]} en dominio '{dom}'", DOC_ARCHITECTURE, path)
            elif status == "M" and _has_signature_change(path):
                add(f"Firma pública de la fachada de '{dom}' modificada",
                    DOC_ARCHITECTURE, path)
            continue

        # 4. Contrato de repositorio + token.
        if RE_REPO_CONTRACT.search(path):
            if status in ("A", "D", "R"):
                add(f"Contrato de repositorio {_VERB[status]} en dominio '{dom}'",
                    DOC_ARCHITECTURE, path)
            elif status == "M" and _has_signature_change(path):
                add(f"Contrato/token de repositorio de '{dom}' modificado",
                    DOC_ARCHITECTURE, path)
            continue

        # 5. Service / emitter / controller (agregar o eliminar).
        if RE_SERVICE.search(path) and status in ("A", "D", "R"):
            add(f"Service {_VERB[status]} en dominio '{dom}'", DOC_ARCHITECTURE, path)
            continue
        if RE_EMITTER.search(path) and status in ("A", "D", "R"):
            add(f"Emitter {_VERB[status]} en dominio '{dom}'", DOC_ARCHITECTURE, path)
            continue
        if RE_CONTROLLER.search(path) and status in ("A", "D", "R"):
            add(f"Controller {_VERB[status]} en dominio '{dom}'", DOC_ARCHITECTURE, path)
            continue

    # Dedupe por (desc, doc).
    seen, unique = set(), []
    for f in findings:
        key = (f["desc"], f["doc"])
        if key not in seen:
            seen.add(key)
            unique.append(f)
    return unique


# --------------------------------------------------------------------------- #
# Salida
# --------------------------------------------------------------------------- #
def _block_message(findings: list[dict], stale_docs: set[str]) -> str:
    lines = [
        "",
        "✗ Cambio de arquitectura sin documentación actualizada.",
        "",
        "  Cambios de arquitectura detectados en este commit:",
    ]
    for f in findings:
        lines.append(f"    • {f['desc']}")
        lines.append(f"        ↳ {f['path']}")
    lines += ["", "  Documentos de arquitectura desactualizados (no staged en este commit):"]
    for doc in sorted(stale_docs):
        lines.append(f"    • {doc}")
    lines += [
        "",
        "  Qué hacer:",
        "    Ejecutá la skill `update-arch-docs` para regenerar la documentación",
        "    y volvé a commitear (incluyendo los docs actualizados).",
        "",
        "  (Para ver el detalle sin bloquear:  python3 scripts/arch-drift.py --check)",
        "",
    ]
    return "\n".join(lines)


def main(argv: list[str]) -> int:
    check_mode = "--check" in argv
    changes = staged_changes()
    findings = detect(changes)

    if not findings:
        if check_mode:
            print("✓ Sin cambios de arquitectura en el staging area.")
        return 0

    required_docs = {f["doc"] for f in findings}
    staged_paths = {p for _, p in changes}
    stale_docs = {doc for doc in required_docs if doc not in staged_paths}

    if check_mode:
        print("Cambios de arquitectura detectados:")
        for f in findings:
            print(f"  • {f['desc']}  ({f['path']})")
        print()
        for doc in sorted(required_docs):
            mark = "DESACTUALIZADO" if doc in stale_docs else "ok (staged)"
            print(f"  doc {doc}: {mark}")
        return 0

    # Modo bloqueo.
    if not stale_docs:
        return 0  # docs actualizados en el mismo commit → pasa en silencio.
    sys.stderr.write(_block_message(findings, stale_docs))
    return 1


if __name__ == "__main__":
    raise SystemExit(main(sys.argv[1:]))
