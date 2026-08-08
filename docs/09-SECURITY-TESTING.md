# 09 · Seguridad y testing

> Expansión de las secciones 2.5 y 2.6 del [README](../README.md).

## Seguridad

| Aspecto | Estado actual | Futuro |
|---------|---------------|--------|
| Autenticación | **Google OAuth 2.0 mediado por el backend + JWT propio** (`Bearer`). Sin token se cae al usuario del MVP mientras `AUTH_REQUIRED=false` | `AUTH_REQUIRED=true` cuando la app publicada sólo entre con Google |
| Sesión | JWT firmado con `JWT_SECRET`, 30 días, guardado en el dispositivo con `expo-secure-store` (Keychain / EncryptedSharedPreferences) | Refresh tokens + access token de minutos |
| Autorización | Filtrado por el `userId` del token en cada repo/query | igual |
| Validación de entrada | DTOs con `class-validator` en todos los endpoints | igual |
| Subida de imágenes | Bucket S3 privado; la API sirve los objetos, el host de storage no se expone | URLs firmadas |
| Errores | Filtro global de excepciones (no filtra stack al cliente) | igual |
| Secrets | `DATABASE_URL`, `JWT_SECRET`, `GOOGLE_CLIENT_SECRET` y llaves S3 en `.env` (no commiteado) | secret manager |

> **Nota de diseño:** todas las entidades llevan `userId` desde el MVP. Activar auth
> multi-usuario sólo cambió *cómo* se resuelve ese `userId` (del guard fijo al JWT), no
> el modelo ni los casos de uso.

### Superficie de ataque del login y cómo se cierra

| Riesgo | Mitigación |
|--------|------------|
| **Robo del `client_secret`** | Nunca entra al bundle de la app: el canje del código ocurre server-to-server. Es la razón principal de mediar el OAuth por el backend. |
| **Open redirect / robo de sesión** | El callback redirige con el token en la URL, así que el destino se valida contra `AUTH_ALLOWED_REDIRECTS` antes de emitirlo. En dev se acepta además `exp://` hacia loopback o IP privada (RFC 1918), nunca en producción. |
| **Interceptación del `code`** | PKCE S256: el `code_verifier` nunca sale del backend (viaja firmado dentro del `state`). |
| **CSRF / manipulación del `state`** | El `state` es un JWT firmado con TTL de 10 min; si no valida, `400` y el flujo muere. |
| **`id_token` de otra aplicación** | Se verifica firma, emisor y **audiencia** contra nuestro `client_id`. |
| **Apropiación de cuenta por email** | La vinculación por email sólo procede si Google marcó `email_verified`. |
| **Token vencido usado en silencio** | Un Bearer inválido siempre es `401`, incluso con el fallback demo activo: nunca degrada a otro usuario. |

## Estrategia de testing

### Backend

| Nivel | Qué se prueba | Herramienta |
|-------|---------------|-------------|
| Unit | Reglas de dominio: outfit con **≥2 prendas**, un solo `PlannedOutfit` activo, archivado lógico | Jest |
| Unit | Casos de uso y facades (orquestación) con repos mockeados | Jest + spies |
| e2e | Flujos HTTP: crear prenda → crear outfit → planear → confirmar | Jest + Supertest |

Reglas de test (alineadas con las prácticas del autor): mockear sólo lo que se usa,
preferir spies sobre stubs profundos, `jest.clearAllMocks()` en `afterEach`, 1–2
asserts por comportamiento. Detalle completo (mocking en `TestingModule`, formato/lint,
alcance): ver [`CODING-CONVENTIONS.md §4`](CODING-CONVENTIONS.md).

### Mobile

| Nivel | Qué se prueba | Herramienta |
|-------|---------------|-------------|
| Unit | Componentes clave (ClothesCard, OutfitPreview) y hooks de filtros | Jest + RN Testing Library |
| Integración | Render de pantallas con React Query mockeado | RN Testing Library |

### Casos de prueba críticos (invariantes)

1. Crear outfit con 1 prenda → `400`.
2. Quitar item dejando 1 prenda → bloqueado.
3. Fijar segundo `PlannedOutfit` → el primero queda `cancelled`.
4. `DELETE` de prenda → `isActive=false`, no desaparece de la DB.
5. Prenda duplicada en el mismo outfit → rechazada.
