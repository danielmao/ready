# Activar el enforcement de arquitectura en `apps/backend`

> Esta nota está pensada para el momento en que scaffoldees el backend (NestJS + Prisma).
> Hasta entonces, `.dependency-cruiser.cjs` ya está listo pero dormido.

## 1. Bloque para `package.json` (merge, no reemplazar)

Cuando el generador (`nest new` o similar) cree `apps/backend/package.json`, fusioná estas
entradas:

```jsonc
{
  "scripts": {
    "lint:arch": "depcruise src --config .dependency-cruiser.cjs"
  },
  "devDependencies": {
    "dependency-cruiser": "^16.0.0"
  }
}
```

> `dependency-cruiser` usa TypeScript (que NestJS ya trae) para resolver imports; la config
> apunta a `tsconfig.json`. Fijá la versión a la última estable si `^16` quedó vieja.

Instalación en un paso:

```bash
cd apps/backend && npm i -D dependency-cruiser
```

## 2. Verificación

```bash
cd apps/backend && npm run lint:arch
```

Debe pasar en verde con el código que respeta las capas. Para probar que las reglas
muerden, hacé un import prohibido a propósito (p. ej. un use-case importando algo de
`infrastructure/`, o un dominio importando el repo de otro en vez de su facade) y confirmá
que `lint:arch` lo bloquea. Esto valida en particular la regla `cross-domain-only-via-facade`
(que usa group-matching de dependency-cruiser).

## 3. Pre-commit

Ya está enchufado: `.githooks/pre-commit` ejecuta `npm run lint:arch` automáticamente
**solo** cuando existe `apps/backend/package.json` y hay archivos staged bajo
`apps/backend/src/`. No hay que tocar nada más.

## 4. CI (opcional pero recomendado)

Agregá el mismo comando como paso de CI para que el enforcement no dependa solo del
pre-commit local:

```yaml
- run: cd apps/backend && npm ci && npm run lint:arch
```

Reglas y racional: ver `apps/backend/.dependency-cruiser.cjs` y `docs/02-ARCHITECTURE.md §6`.
