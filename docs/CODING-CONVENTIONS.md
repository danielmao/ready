# Convenciones de código — Ready

> Reglas operativas que sigue cualquier sesión de Claude Code al implementar Ready.
> Adaptadas de las prácticas del autor (rules de su monorepo). Las reglas de **arquitectura**
> (capas, boundaries, fachadas) NO se repiten acá: viven en
> [`02-ARCHITECTURE.md`](02-ARCHITECTURE.md) §3 y §3 bis y se hacen cumplir con
> `dependency-cruiser` (§6). Esto cubre código general, logging y testing.

## 1. Reglas generales

- Sin código muerto: si no se usa, se borra.
- Nombres descriptivos, sin abreviaciones crípticas.
- Funciones cortas, un solo propósito. Composición sobre herencia.
- Toda dependencia nueva requiere justificación; preferir lo que ya está en el stack.

## 2. Manejo de errores

- Nunca swallow errors en silencio: o se maneja, o se relanza.
- Usar tipos de error específicos del dominio (no `Error` genérico para reglas de negocio).
- Loggear con contexto suficiente para debuggear (ver §3).

## 3. Logging

> **Logger: `nestjs-pino`** (decisión registrada en `02-ARCHITECTURE.md §2`). Las reglas de
> abajo son las del logging estructurado de pino.

1. **Siempre datos estructurados** — objeto primero, mensaje después.
   - ✅ `this.logger.info({ userId, outfitId }, 'Outfit created')`
   - ❌ `this.logger.info('Outfit created: ' + outfitId)`
2. **Nunca pasar el Error como segundo argumento** (pierde stack y campos).
   - ❌ `logger.error('algo falló', error)`
   - ✅ `logger.error({ err: error, outfitId }, 'No se pudo crear el outfit')` — la clave debe ser `err`
3. **Orden**: datos primero, mensaje después.
4. **Niveles**: `error` (operación falló, requiere atención) · `warn` (inesperado pero
   manejado) · `info` (eventos de negocio) · `debug` (troubleshooting; fuera de prod).
5. **Incluir IDs de dominio**: `userId`, `clothingItemId`, `outfitId`, `plannedOutfitId`,
   `requestId`, `operation`.
6. **Type safety con errores desconocidos**:
   ```typescript
   } catch (e: unknown) {
     const err = e instanceof Error ? e : new Error(String(e));
     this.logger.error({ err, outfitId }, 'Operación falló');
     throw err;
   }
   ```

**Evitar**: `logger.error('msg', err)`; loggear solo un mensaje sin estructura ni IDs;
concatenar strings en vez de objetos; swallow tras loggear (relanzar salvo que se maneje);
loggear secretos/PII.

## 4. Testing (Jest)

> La **estrategia** (qué se prueba por nivel + invariantes críticos) está en
> [`09-SECURITY-TESTING.md`](09-SECURITY-TESTING.md). Esto es el **cómo** escribir el test.

### Mocking
- **Mockear solo lo que se usa**: en los mocks, incluir solo los campos que el código bajo
  test accede o que se asertan en `expect(...)`.
- **Solo los métodos necesarios**: en providers de `TestingModule` (`useValue`), definir solo
  los métodos que el test llama.
- **Spies sobre stubs profundos**:
  `jest.spyOn(obj, 'method').mockResolvedValue(...)` / `.mockReturnValue(...)`.

### Higiene
- `afterEach(() => { jest.clearAllMocks(); });`
- Tests mínimos: 1–2 asserts por comportamiento; no sobre-especificar campos no relacionados.
- El nombre del test describe el comportamiento (el test es documentación).

### Formato y alcance
- Correr Prettier y asegurar que ESLint pasa en los archivos de test cambiados.
- Correr **solo el spec del cambio**, no la suite entera:
  `npx jest src/{domain} --no-coverage`.
- `.spec.ts` colocado junto al archivo que prueba.
