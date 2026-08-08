/**
 * Valida a qué URL de la app tenemos permitido devolver al usuario al final del login.
 *
 * Esto no es cosmética: el callback termina en un redirect **con el access token en la URL**.
 * Sin lista blanca, cualquiera podría llamar a `/api/auth/google?redirect_uri=https://evil...`
 * y quedarse con la sesión de quien pique (open redirect + robo de token). Sólo se acepta un
 * destino declarado en `AUTH_ALLOWED_REDIRECTS`.
 *
 * Excepción acotada a desarrollo: Expo Go no tiene un scheme fijo — el deep link es
 * `exp://<ip-de-tu-máquina>:8081/--/...` y esa IP cambia de red en red, así que listarla a
 * mano sería inusable. Fuera de producción se acepta cualquier `exp://` apuntando a
 * localhost o a una IP privada (RFC 1918). En producción no aplica: sólo la lista blanca.
 */

/** Destinos declarados explícitamente, separados por coma. */
function allowList(): string[] {
  return (process.env.AUTH_ALLOWED_REDIRECTS ?? '')
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean);
}

/** `exp://` hacia loopback o red privada: el patrón de Expo Go en la LAN del dev. */
function isExpoGoDevRedirect(uri: string): boolean {
  let parsed: URL;
  try {
    parsed = new URL(uri);
  } catch {
    return false;
  }
  if (parsed.protocol !== 'exp:') return false;

  const host = parsed.hostname;
  return (
    host === 'localhost' ||
    host === '127.0.0.1' ||
    /^10\./.test(host) ||
    /^192\.168\./.test(host) ||
    /^172\.(1[6-9]|2\d|3[01])\./.test(host)
  );
}

/** ¿Podemos devolver al usuario a esta URL con su token? */
export function isAllowedAppRedirect(uri: string): boolean {
  if (allowList().includes(uri)) return true;
  if (process.env.NODE_ENV === 'production') return false;
  return isExpoGoDevRedirect(uri);
}

/**
 * Pega el token (o el error) al deep link de vuelta, respetando si la URL ya traía query.
 * Se usa query string y no fragmento porque `expo-web-browser` entrega la URL completa a la
 * app y el fragmento es incómodo de leer en React Native.
 */
export function buildAppCallbackUrl(
  redirectUri: string,
  params: Record<string, string>,
): string {
  const separator = redirectUri.includes('?') ? '&' : '?';
  const query = new URLSearchParams(params).toString();
  return `${redirectUri}${separator}${query}`;
}
