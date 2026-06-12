#!/usr/bin/env python3
"""arch-docs — regenera la documentación de arquitectura desde el código real.

Es el MOTOR de la skill `update-arch-docs` (contraparte del hook de pre-commit
scripts/arch-drift.py). El hook DETECTA drift y bloquea; este generador ACTUALIZA
la documentación para que vuelva a reflejar la realidad del repo.

Comparte la taxonomía de capas con el hook vía scripts/arch_rules.py (única fuente
de verdad): si una capa cambia de lugar, ambos cambian a la vez.

Qué hace:
  1. Lee apps/backend/src/ y apps/backend/prisma/schema.prisma.
  2. Deriva del código: dominios, casos de uso, fachadas (+ API pública), contratos
     (+ token), services, emitters, controllers, y dependencias entre dominios
     (qué fachada ajena consume cada uno).
  3. Reescribe SOLO los bloques  <!-- AUTO-GENERATED:<name>:start/end -->  dentro de
     docs/02-ARCHITECTURE.md (módulos + dependencias) y docs/03-DATA-MODEL.md
     (modelo de datos). La prosa escrita a mano fuera de los marcadores se preserva.
  4. Reporta el resumen de qué cambió.

Determinista (iteración ordenada, mismo repo → misma doc), no toca código fuente,
sin red, sin dependencias externas (git no es necesario; solo lee el filesystem).

Modos:
  (sin flag)   Escribe los docs y reporta el resumen.
  --check      No escribe; reporta qué cambiaría. Exit 1 si hay cambios pendientes,
               0 si la doc ya está al día (útil para CI).
"""

from __future__ import annotations

import re
import sys
from pathlib import Path

import arch_rules as R  # sys.path[0] == dir del script al ejecutarse

# --------------------------------------------------------------------------- #
# Regex de parsing TS / Prisma (tolerantes; el objetivo es inventario, no compilar)
# --------------------------------------------------------------------------- #
RE_EXPORT_CLASS = re.compile(r"export\s+(?:abstract\s+)?class\s+([A-Za-z_]\w*)")
RE_EXPORT_IFACE = re.compile(r"export\s+interface\s+([A-Za-z_]\w*)")
RE_DI_TOKEN = re.compile(r"export\s+const\s+([A-Z0-9_]+)\s*=\s*Symbol")
# Método/firma pública dentro de una clase o interface: name(args): ReturnType
RE_METHOD = re.compile(
    r"^\s*(?:public\s+|async\s+)*([a-z_]\w*)\s*\(([^)]*)\)\s*:\s*([^\{;\n]+)",
    re.M,
)
RE_PRISMA_BLOCK = re.compile(r"^(model|enum)\s+(\w+)\s*\{(.*?)^\}", re.S | re.M)

MARKER_NOTE = "<!-- Generado por scripts/arch-docs.py — no editar a mano dentro de este bloque. -->"


# --------------------------------------------------------------------------- #
# Lectura del filesystem
# --------------------------------------------------------------------------- #
def _read(path: Path) -> str:
    try:
        return path.read_text(encoding="utf-8")
    except (OSError, UnicodeDecodeError):
        return ""


def _ts_files(d: Path) -> list[Path]:
    if not d.is_dir():
        return []
    return sorted(
        (p for p in d.rglob("*.ts") if not p.name.endswith((".spec.ts", ".test.ts"))),
        key=lambda p: p.as_posix(),
    )


def _exported_names(path: Path, regex: re.Pattern) -> list[str]:
    return sorted(set(regex.findall(_read(path))))


def _public_methods(path: Path) -> list[str]:
    methods = []
    for name, args, ret in RE_METHOD.findall(_read(path)):
        if name in ("constructor", "if", "for", "while", "switch", "catch"):
            continue
        methods.append(f"{name}({args.strip()}): {ret.strip()}")
    # dedupe preservando orden estable (ordenado)
    return sorted(set(methods))


# --------------------------------------------------------------------------- #
# Derivación del modelo de arquitectura
# --------------------------------------------------------------------------- #
def discover_domains(root: Path) -> list[str]:
    base = root / R.BACKEND_SRC
    if not base.is_dir():
        return []
    return sorted(
        d.name for d in base.iterdir()
        if d.is_dir() and d.name not in R.NON_DOMAIN_DIRS
    )


def domain_model(root: Path, domain: str) -> dict:
    base = root / R.BACKEND_SRC / domain
    L = R.LAYER_DIRS

    use_cases = []
    for f in _ts_files(base / L["use_cases"]):
        use_cases.extend(_exported_names(f, RE_EXPORT_CLASS) or [f.stem])

    facades = []
    for f in _ts_files(base / L["facades"]):
        for cls in _exported_names(f, RE_EXPORT_CLASS) or [f.stem]:
            facades.append({"name": cls, "methods": _public_methods(f)})

    contracts = []
    for f in _ts_files(base / L["repositories"]):
        names = _exported_names(f, RE_EXPORT_IFACE) or _exported_names(f, RE_EXPORT_CLASS)
        tokens = _exported_names(f, RE_DI_TOKEN)
        for n in names or [f.stem]:
            contracts.append({"name": n, "tokens": tokens, "methods": _public_methods(f)})

    def _classes(layer):
        out = []
        for f in _ts_files(base / L[layer]):
            out.extend(_exported_names(f, RE_EXPORT_CLASS) or [f.stem])
        return sorted(set(out))

    return {
        "domain": domain,
        "use_cases": sorted(set(use_cases)),
        "facades": facades,
        "contracts": contracts,
        "services": _classes("services"),
        "emitters": _classes("emitters"),
        "controllers": _classes("controllers"),
    }


def derive_dependencies(root: Path, models: list[dict]) -> dict[str, list[str]]:
    """domain → [otros dominios cuya FACHADA consume]. Detecta uso del nombre de
    clase de la fachada ajena dentro de los .ts del dominio."""
    facade_owner: dict[str, str] = {}
    for m in models:
        for fac in m["facades"]:
            facade_owner[fac["name"]] = m["domain"]

    deps: dict[str, set[str]] = {m["domain"]: set() for m in models}
    for m in models:
        base = root / R.BACKEND_SRC / m["domain"]
        text = "\n".join(_read(f) for f in _ts_files(base))
        for facade_name, owner in facade_owner.items():
            if owner == m["domain"]:
                continue
            if re.search(rf"\b{re.escape(facade_name)}\b", text):
                deps[m["domain"]].add(owner)
    return {d: sorted(s) for d, s in deps.items()}


def parse_prisma(root: Path) -> list[dict]:
    text = _read(root / R.PRISMA_SCHEMA)
    if not text:
        return []
    blocks = []
    for kind, name, body in RE_PRISMA_BLOCK.findall(text):
        entries = []
        for line in body.splitlines():
            s = line.strip()
            if not s or s.startswith("//") or s.startswith("@@"):
                continue
            toks = s.split()
            if kind == "enum":
                entries.append(toks[0])
            elif len(toks) >= 2:
                entries.append((toks[0], toks[1]))
        blocks.append({"kind": kind, "name": name, "entries": entries})
    return sorted(blocks, key=lambda b: (b["kind"], b["name"]))


# --------------------------------------------------------------------------- #
# Render de cada sección (markdown derivado)
# --------------------------------------------------------------------------- #
def render_modules(models: list[dict]) -> str:
    if not models:
        return "_Sin dominios todavía: `apps/backend/src/` aún no existe._"
    out = []
    for m in models:
        out.append(f"### Dominio `{m['domain']}`")
        out.append("")
        uc = ", ".join(f"`{x}`" for x in m["use_cases"]) or "—"
        out.append(f"- **Casos de uso:** {uc}")
        if m["facades"]:
            for fac in m["facades"]:
                meths = "; ".join(f"`{x}`" for x in fac["methods"]) or "—"
                out.append(f"- **Fachada `{fac['name']}`** (API pública) — métodos: {meths}")
        else:
            out.append("- **Fachada:** —")
        if m["contracts"]:
            for c in m["contracts"]:
                tok = ", ".join(f"`{t}`" for t in c["tokens"]) or "—"
                out.append(f"- **Contrato `{c['name']}`** — token: {tok}")
        else:
            out.append("- **Contrato de repositorio:** —")
        out.append(f"- **Services:** {', '.join(f'`{x}`' for x in m['services']) or '—'}")
        out.append(f"- **Emitters:** {', '.join(f'`{x}`' for x in m['emitters']) or '—'}")
        out.append(f"- **Controllers:** {', '.join(f'`{x}`' for x in m['controllers']) or '—'}")
        out.append("")
    return "\n".join(out).rstrip()


def render_dependencies(models: list[dict], deps: dict[str, list[str]]) -> str:
    if not models:
        return "_Sin dominios todavía._"
    rows = ["| Dominio | Consume (vía fachada) |", "|---|---|"]
    for m in models:
        d = m["domain"]
        consumes = ", ".join(f"`{x}`" for x in deps.get(d, [])) or "—"
        rows.append(f"| `{d}` | {consumes} |")
    edges = []
    for d, others in deps.items():
        for o in others:
            edges.append(f"    {d} --> {o}")
    diagram = ["```mermaid", "graph LR"]
    diagram += edges if edges else ["    %% sin dependencias entre dominios"]
    diagram.append("```")
    note = (
        "\n> El cruce entre dominios ocurre **solo vía fachada**. La tabla lista las "
        "fachadas ajenas efectivamente referenciadas en el código de cada dominio."
    )
    return "\n".join(rows) + "\n\n" + "\n".join(diagram) + "\n" + note


def render_data_model(blocks: list[dict]) -> str:
    if not blocks:
        return "_Sin `schema.prisma` todavía._"
    out = []
    for b in blocks:
        if b["kind"] == "enum":
            vals = ", ".join(f"`{v}`" for v in b["entries"]) or "—"
            out.append(f"### enum `{b['name']}`")
            out.append("")
            out.append(f"Valores: {vals}")
        else:
            out.append(f"### model `{b['name']}`")
            out.append("")
            out.append("| Campo | Tipo |")
            out.append("|---|---|")
            for fname, ftype in b["entries"]:
                out.append(f"| `{fname}` | `{ftype}` |")
        out.append("")
    return "\n".join(out).rstrip()


# --------------------------------------------------------------------------- #
# Upsert de bloques AUTO-GENERATED (preserva todo lo demás)
# --------------------------------------------------------------------------- #
def upsert_block(text: str, name: str, heading: str, body: str) -> tuple[str, str]:
    start = f"<!-- AUTO-GENERATED:{name}:start -->"
    end = f"<!-- AUTO-GENERATED:{name}:end -->"
    block = f"{start}\n{MARKER_NOTE}\n\n{body.rstrip()}\n\n{end}"
    pattern = re.compile(re.escape(start) + r".*?" + re.escape(end), re.S)
    m = pattern.search(text)
    if m:
        if m.group(0) == block:
            return text, "sin cambios"
        return text[: m.start()] + block + text[m.end():], "actualizado"
    sep = "" if text.endswith("\n\n") or text == "" else ("\n" if text.endswith("\n") else "\n\n")
    return text + sep + f"{heading}\n\n{block}\n", "creado"


def update_file(root: Path, rel_path: str, sections: list[tuple[str, str, str]], write: bool) -> dict:
    path = root / rel_path
    original = _read(path)
    text = original if original else f"# {Path(rel_path).stem}\n"
    statuses = {}
    for name, heading, body in sections:
        text, st = upsert_block(text, name, heading, body)
        statuses[name] = st
    changed = text != original
    if changed and write:
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(text, encoding="utf-8")
    return {"path": rel_path, "changed": changed, "sections": statuses}


# --------------------------------------------------------------------------- #
# Main
# --------------------------------------------------------------------------- #
def main(argv: list[str]) -> int:
    check = "--check" in argv
    root = Path.cwd()

    domains = discover_domains(root)
    models = [domain_model(root, d) for d in domains]
    deps = derive_dependencies(root, models)
    prisma = parse_prisma(root)

    arch_sections = [
        ("modules", "## Inventario de módulos (derivado del código)", render_modules(models)),
        ("dependencies", "## Dependencias entre dominios (derivado del código)",
         render_dependencies(models, deps)),
    ]
    data_sections = [
        ("data-model", "## Modelos (derivado de `schema.prisma`)", render_data_model(prisma)),
    ]

    results = [
        update_file(root, R.DOC_ARCHITECTURE, arch_sections, write=not check),
        update_file(root, R.DOC_DATA_MODEL, data_sections, write=not check),
    ]

    # Resumen.
    n_uc = sum(len(m["use_cases"]) for m in models)
    n_fac = sum(len(m["facades"]) for m in models)
    n_dep = sum(len(v) for v in deps.values())
    print(f"Resumen — update-arch-docs{' (modo --check, sin escribir)' if check else ''}")
    print(f"  Derivado: {len(domains)} dominio(s), {n_uc} caso(s) de uso, "
          f"{n_fac} fachada(s), {n_dep} dependencia(s) entre dominios, "
          f"{len(prisma)} bloque(s) en schema.prisma.")
    if domains:
        print(f"  Dominios: {', '.join(domains)}")
    any_changed = False
    for r in results:
        any_changed = any_changed or r["changed"]
        secs = ", ".join(f"{k}: {v}" for k, v in r["sections"].items())
        flag = "MODIFICADO" if r["changed"] else "sin cambios"
        print(f"  {r['path']} [{flag}] — {secs}")

    if check:
        if any_changed:
            print("\n  La documentación NO está al día. Corré: python3 scripts/arch-docs.py")
            return 1
        print("\n  La documentación de arquitectura está al día.")
        return 0
    return 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv[1:]))
