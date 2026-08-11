---
category: backend
source_raw: _inbox/20260811-203412-funcional-el-autenticador-de-google-para-eso.md
captured_at: 2026-08-11T20:34:12+00:00
status: curated
---

# Login con Google funcional + credenciales como variable de entorno

**Intención.** Cerrar la última deuda del MVP: que el botón "Continuar con Google" —hasta
entonces un gate de UI que no validaba nada— autenticara de verdad. El usuario pidió
explícitamente **asistencia para crear el proyecto/cliente OAuth en Google Cloud** y que las
credenciales quedaran como variables de entorno, no hardcodeadas.

**Contexto / decisión.** La primera bifurcación definió todo lo demás: Google Sign-In **nativo**
ya no funciona en Expo Go (exige development build y tres clientes OAuth con SHA-1). Se eligió
**OAuth 2.0 mediado por el backend** con un único cliente de tipo *Web application*: el canje del
código ocurre server-to-server, así el `client_secret` nunca entra al bundle de la app —de donde
cualquiera podría extraerlo— y el proyecto sigue corriendo en Expo Go sin infraestructura de
build. Costo aceptado: el login abre el navegador del sistema en vez de la hoja nativa.

Decisiones derivadas: `state` como JWT firmado de vida corta (lleva adentro el destino y el
verifier PKCE, así no hacen falta sesiones en memoria); **lista blanca** de deep links, porque el
callback redirige con el token en la URL y sin ella sería un open redirect que regala sesiones;
vinculación por email verificado, para que el usuario sembrado —con su armario ya cargado— sea el
mismo que entra por Google; y fallback del guard a `MVP_USER_ID` mientras `AUTH_REQUIRED=false`,
que mantiene vivos el modo demo y los e2e sin token.

Sobre las credenciales: el asistente guió la creación del cliente en Google Cloud paso a paso
(incluido el error de pegar el callback en "Orígenes autorizados de JavaScript", que no acepta
rutas), pero **nunca manipuló el `client_secret`**: lo puso el usuario en el `.env` gitignoreado.

**Resultado.** Dominio `auth` (DDD por capas, terminal) + `UsersFacade` nueva + migración
`users.googleId`; mobile con `expo-web-browser`, token en `expo-secure-store`, interceptor Bearer
y manejo central del 401. Verificado con `jest src/auth src/users`, `lint:arch`, typecheck mobile
y smokes HTTP contra el deploy (whitelist, PKCE S256, 401, `state` inválido). Spec:
`docs/specs/active/google-auth.md`.
