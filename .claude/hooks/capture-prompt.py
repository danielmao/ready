#!/usr/bin/env python3
"""
UserPromptSubmit hook — captura determinista de prompts (sin LLM).

Lee el JSON del evento por stdin, guarda el prompt CRUDO e intacto en
prompts/_inbox/ como evidencia del uso de IA en el proyecto Ready.

Diseño:
- NO juzga relevancia, NO corrige, NO enriquece. Eso lo hace la curación
  on-demand (/curate-prompts), que lee este inbox. Aquí solo se preserva
  la evidencia original.
- Nunca bloquea ni ensucia el turno: pase lo que pase, sale con código 0
  y sin stdout. Cualquier error se traga en silencio (best-effort).

Claude Code inyecta CLAUDE_PROJECT_DIR apuntando a la raíz del proyecto.
"""

import json
import os
import re
import sys
from datetime import datetime, timezone


def slugify(text: str, max_words: int = 7) -> str:
    words = re.findall(r"[a-z0-9]+", text.lower())[:max_words]
    slug = "-".join(words)
    return (slug[:60] or "prompt").strip("-")


def main() -> None:
    raw = sys.stdin.read()
    try:
        event = json.loads(raw)
    except (json.JSONDecodeError, ValueError):
        return  # entrada no parseable: no hacemos nada

    prompt = (event.get("prompt") or "").strip()
    if not prompt:
        return  # nada que guardar

    # Ignorar comandos puros (slash commands como /curate-prompts): son ruido,
    # no evidencia de construcción del producto.
    if prompt.startswith("/"):
        return

    project_dir = os.environ.get("CLAUDE_PROJECT_DIR") or event.get("cwd") or os.getcwd()
    inbox = os.path.join(project_dir, "prompts", "_inbox")
    os.makedirs(inbox, exist_ok=True)

    now = datetime.now(timezone.utc)
    stamp = now.strftime("%Y%m%d-%H%M%S")
    fname = f"{stamp}-{slugify(prompt)}.md"
    path = os.path.join(inbox, fname)

    # Evitar colisiones si dos prompts caen en el mismo segundo
    n = 2
    while os.path.exists(path):
        path = os.path.join(inbox, f"{stamp}-{slugify(prompt)}-{n}.md")
        n += 1

    session_id = event.get("session_id", "")
    body = (
        "---\n"
        f"captured_at: {now.isoformat()}\n"
        f"session_id: {session_id}\n"
        f"cwd: {event.get('cwd', '')}\n"
        "status: raw\n"
        "curated: false\n"
        "category: null\n"
        "---\n\n"
        f"{prompt}\n"
    )

    with open(path, "w", encoding="utf-8") as fh:
        fh.write(body)


if __name__ == "__main__":
    try:
        main()
    except Exception:
        pass  # best-effort: jamás romper el turno del usuario
    sys.exit(0)
