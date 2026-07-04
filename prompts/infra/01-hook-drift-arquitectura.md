---
category: infra
source_raw: _inbox/20260612-050955-crear-un-hook-que-detecte-drift-entre.md
captured_at: 2026-06-12T05:09:55+00:00
status: curated
---

# Hook de pre-commit que detecta drift entre código y doc de arquitectura

**Intención.** Garantizar que ningún cambio que afecte la arquitectura DDD por capas
entre al repo sin que la documentación de arquitectura se actualice en el mismo commit.
El hook **no escribe** documentación: solo detecta el desfasaje y bloquea el commit
indicando qué hacer.

**Contexto / decisión.** El prompt llegó como un encargo de "ingeniero de plataforma":
diseñar primero y esperar validación antes de implementar. Se definió de forma explícita
**qué cuenta como cambio de arquitectura** (crear/eliminar un dominio, agregar/renombrar
un caso de uso o fachada, cambiar un contrato de repositorio o su token, agregar/eliminar
service/emitter/controller, cambiar el wiring de un `{domain}.module.ts`, o tocar
`schema.prisma`) frente a lo que **no** cuenta (cambiar el cuerpo de un método sin alterar
firmas, carpetas ni dependencias).

Comportamiento acordado:

- Se dispara en `pre-commit` sobre los archivos *staged*.
- Si **no** hubo cambio de arquitectura → sale en silencio y deja pasar el commit.
- Si **sí** lo hubo y la doc de `docs/architecture/` no fue tocada en el mismo commit →
  **falla** con un mensaje que nombra qué cambió, qué doc quedó desactualizado y la
  instrucción concreta: ejecutar la skill `update-arch-docs` y volver a commitear.
- Determinista, rápido, sin red, sin modificar nada, y ejecutable en modo `check` para CI.

**Restricción clave.** Las reglas de "qué cuenta como cambio de arquitectura" del hook
deben coincidir **exactamente** con las que usa la skill `update-arch-docs`; si cambia una,
cambia la otra. El hook dispara la skill avisando al desarrollador, no la reemplaza.

**Resultado.** Se construyó el hook `scripts/arch-drift.py` (instalado en `pre-commit`,
versionado en el repo) + la skill `update-arch-docs` como contraparte que regenera la
documentación. Quedó referenciado en `README.md §2.4` (enforcement de arquitectura) y en
`CLAUDE.md §7`. El prompt completo (diseño íntegro y entregables esperados) queda en el crudo.
