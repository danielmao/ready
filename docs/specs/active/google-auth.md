---
title: Login con Google (dominio Auth) — OAuth mediado por el backend
status: shipped
size_class: medium
owner: @backend-architect
ticket: no aplica (sin tickets en el MVP)
created: 2026-08-08
last_updated: 2026-08-08
---

# Login con Google (dominio Auth) — OAuth mediado por el backend

- **Status:** shipped (backend + mobile; `jest src/auth src/users` + `lint:arch` + typecheck
  mobile + smoke HTTP verdes 2026-08-08). Pendiente: el primer login real end-to-end, que
  requiere las credenciales del cliente OAuth en `.env`.
- **Size class:** medium (dominio nuevo + migración de una columna + cambio en el guard que
  atraviesa toda la API)
- **Owner:** @backend-architect
- **Ticket:** no aplica (sin tickets en el MVP)
- **Created:** 2026-08-08

> Cierra la deuda declarada en `CLAUDE.md §1`: la auth de Google estaba **diferida** y el
> backend era single-user con `userId` fijo. El punto de extensión que se dejó preparado
> (`AuthProvider` + `CurrentUserGuard`) es exactamente por donde entra esto.

## Problema

El botón "Continuar con Google" de `LoginScreen` no valida nada: marca la sesión y deja pasar.
El backend, por su lado, atribuye toda request al mismo `MVP_USER_ID`. Consecuencias:

- La app **no puede tener más de un usuario**: dos personas comparten armario.
- No hay forma de demostrar el flujo de identidad, que es parte del producto.
- Nada del modelo lo impedía —todas las entidades ya tienen `userId`—, sólo faltaba resolverlo.

## Goals

- Login real con Google desde la app, que devuelva una sesión persistente entre arranques.
- Que cada usuario vea **su** armario/outfits/plan, resueltos desde la sesión.
- Cerrar sesión.
- No romper el modo demo ni los e2e existentes, que no mandan token.

## Non-goals

- **Refresh tokens** y expiración corta. El access token dura 30 días y se vuelve a loguear.
- Otros proveedores de identidad (Apple, email/password).
- Borrado de cuenta y export de datos (RGPD) — quedan para después del MVP.
- Roles/permisos: todos los usuarios son iguales.

## Módulos / servicios afectados

- **Nuevo:** `apps/backend/src/auth/` (dominio terminal, sin facade).
- `apps/backend/src/shared/auth/` — `jwt.ts` (nuevo) y `current-user.guard.ts` (reescrito).
- `apps/backend/src/users/` — `UsersFacade` nueva; repositorio con búsqueda/alta por Google.
- `apps/mobile/src/features/auth/`, `providers/AuthProvider.tsx`, `services/apiClient.ts`,
  `navigation/RootNavigator.tsx`, `features/profile/`.

## Contratos afectados

| Endpoint | Cambio |
|----------|--------|
| `GET /api/auth/google?redirect_uri=` | **Nuevo.** 302 a Google. 400 si el destino no está permitido. |
| `GET /api/auth/google/callback` | **Nuevo.** 302 al deep link con `?token=` o `?error=`. |
| Todos los `/api/*` con guard | Aceptan `Authorization: Bearer <jwt>`. Sin token siguen cayendo al usuario del MVP mientras `AUTH_REQUIRED=false`. Con token inválido → **401** (antes: 200). |

## Impacto de base de datos

Migración `20260808120000_add_user_google_id`: `users.googleId TEXT` nullable + índice único.
Nullable a propósito: los usuarios existentes nacen sin ella y se vinculan en su primer login.

## Decisiones de diseño

1. **OAuth mediado por el backend, no SDK nativo.** Las librerías nativas de Google Sign-In
   requieren development build (adiós Expo Go) y tres clientes OAuth con SHA-1. Mediándolo por
   el backend alcanza **un** cliente *Web application*, el `client_secret` nunca entra al
   bundle, y la app sigue en Expo Go. Costo aceptado: navegador del sistema en vez de hoja
   nativa.
2. **`state` como JWT firmado de vida corta**, con el destino y el verifier PKCE adentro. Sin
   almacenamiento de sesiones: sobrevive a reinicios y a múltiples instancias.
3. **Lista blanca de deep links.** El callback redirige con el token en la URL; sin lista
   blanca sería un open redirect que regala sesiones. Excepción acotada a no-producción para
   los `exp://` de Expo Go en IP privada, cuyo host cambia con la red.
4. **Vinculación por email verificado** cuando no hay `googleId`: hace que el usuario sembrado
   del MVP sea el mismo que entra por Google.
5. **Fallback del guard configurable** (`AUTH_REQUIRED`). Permite que login real y modo demo
   convivan durante la transición.

## Edge cases

| Caso | Comportamiento |
|------|----------------|
| El usuario cierra el navegador | `LoginCancelledError`; la pantalla no muestra error. |
| El usuario deniega el permiso en Google | Vuelve con `?error=access_denied` → mensaje claro. |
| `state` manipulado o vencido | **400.** No se puede confiar en el `redirect_uri` sin firmar. |
| Falla el canje del código | Vuelve a la app con `?error=exchange_failed`, no un 500 en el navegador. |
| Email de Google sin verificar | Rechazado: permitiría reclamar la cuenta de otro por email. |
| Token vencido en uso | El interceptor detecta el 401 → cierra sesión → Login. |
| Falta `GOOGLE_CLIENT_ID` | Falla el login, **no** el arranque de la API. |

## Criterios de aceptación

- [x] `GET /api/auth/google` con destino no permitido → 400.
- [x] Con destino permitido → 302 a `accounts.google.com` con `code_challenge_method=S256`.
- [x] `exp://` hacia IP privada aceptado fuera de producción.
- [x] Callback con `state` inválido → 400.
- [x] Request sin token → usuario del MVP (modo demo intacto).
- [x] Request con token inválido → 401.
- [x] Request con token válido → el usuario de ese token.
- [x] La sesión sobrevive a cerrar y abrir la app (SecureStore).
- [x] Perfil muestra la cuenta y permite cerrar sesión.
- [ ] Login real end-to-end contra Google (requiere credenciales en `.env`).

## Plan de test

- `jest src/auth src/users` — use-cases con el proveedor de identidad mockeado.
- `lint:arch` — el dominio nuevo respeta capas y consumo por facade.
- Smoke HTTP contra la API levantada, con credenciales falsas: cubre los 4 caminos del
  contrato sin depender de la red de Google.
- Manual: login, matar la app, reabrir (sesión viva), cerrar sesión.

## Rollout

1. Crear el cliente OAuth *Web application* y completar `GOOGLE_*` en `.env`.
2. Deploy con `AUTH_REQUIRED=false`: login real y demo conviven.
3. Cuando la app publicada sólo entre con Google, pasar `AUTH_REQUIRED=true`.

## Preguntas abiertas

- **Expiración.** 30 días sin refresh es una simplificación consciente; si el proyecto crece,
  meter refresh tokens y bajar el access token a minutos.
- **Google Cloud en modo *Testing*** limita el login a los test users declarados. Publicar la
  app requiere verificación de Google, innecesaria para el entregable.
- **Web.** En web la sesión vive en memoria (no hay SecureStore) y se pierde al recargar.
