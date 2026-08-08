import jwt from 'jsonwebtoken';

/**
 * Firma/verificación de los JWT **propios** de Ready (no los de Google). Vive en `shared`
 * porque lo necesitan dos lados que no pueden importarse entre sí: el dominio `auth`, que
 * emite el token al terminar el login, y `CurrentUserGuard`, que lo valida en cada request.
 *
 * El token de Google se usa una sola vez (para saber quién sos) y se descarta; a partir de
 * ahí la app viaja con este JWT, cuyo `sub` es el id de usuario en nuestra base.
 */

/** Payload de nuestro access token. `sub` = User.id. */
export interface AccessTokenPayload {
  sub: string;
}

/** Vida del access token. Largo a propósito: el MVP no implementa refresh tokens. */
const ACCESS_TOKEN_TTL = '30d';

/**
 * Secreto de firma. Se lee en cada llamada (no en import time) para que los tests puedan
 * setearlo y para no cachear un valor viejo si el proceso recarga el env.
 */
function secret(): string {
  const value = process.env.JWT_SECRET;
  if (!value) {
    throw new Error(
      'Falta JWT_SECRET: sin él no se pueden firmar ni validar sesiones. Ver .env.example.',
    );
  }
  return value;
}

/** Emite el access token de un usuario ya autenticado. */
export function signAccessToken(userId: string): string {
  return jwt.sign({ sub: userId } satisfies AccessTokenPayload, secret(), {
    expiresIn: ACCESS_TOKEN_TTL,
  });
}

/** Devuelve el `sub` del token, o `null` si es inválido, expirado o de otro emisor. */
export function verifyAccessToken(token: string): string | null {
  try {
    const payload = jwt.verify(token, secret());
    return typeof payload === 'object' && typeof payload.sub === 'string'
      ? payload.sub
      : null;
  } catch {
    return null;
  }
}

/**
 * Firma un payload arbitrario con TTL corto. Lo usa el flujo OAuth para el parámetro
 * `state`: en vez de guardar sesiones en memoria (que se pierden si el proceso reinicia o
 * si hay más de una instancia), el estado del login viaja firmado en la propia URL.
 */
export function signShortLived(payload: object, ttlSeconds: number): string {
  return jwt.sign(payload, secret(), { expiresIn: ttlSeconds });
}

/** Contracara de {@link signShortLived}. Devuelve `null` si fue manipulado o expiró. */
export function verifyShortLived<T>(token: string): T | null {
  try {
    return jwt.verify(token, secret()) as T;
  } catch {
    return null;
  }
}
