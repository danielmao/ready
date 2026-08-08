import {
  type CanActivate,
  type ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request } from 'express';

import { verifyAccessToken } from './jwt';

/**
 * Resuelve el usuario de la request y lo deja en `request.userId` para que `@CurrentUser()`
 * lo lea. Tres caminos, en este orden:
 *
 * 1. Hay `Authorization: Bearer <jwt>` válido → el userId sale del token (login con Google).
 * 2. No hay token y `AUTH_REQUIRED=true` → 401.
 * 3. No hay token y `AUTH_REQUIRED` está apagado → cae al usuario único del MVP
 *    (`MVP_USER_ID`). Es lo que mantiene vivos el modo demo y los e2e sin login.
 *
 * Un token presente pero inválido/expirado SIEMPRE es 401, aunque el fallback esté activo:
 * si el cliente afirma tener sesión y no es cierto, el error debe ser explícito y no
 * degradar silenciosamente a otro usuario.
 */
export const MVP_USER_ID =
  process.env.MVP_USER_ID ?? '00000000-0000-0000-0000-000000000001';

/** Con `AUTH_REQUIRED=true` la API deja de aceptar requests anónimas. */
function authRequired(): boolean {
  return process.env.AUTH_REQUIRED === 'true';
}

@Injectable()
export class CurrentUserGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context
      .switchToHttp()
      .getRequest<Request & { userId?: string }>();

    const token = extractBearer(request.headers.authorization);

    if (token) {
      const userId = verifyAccessToken(token);
      if (!userId) {
        throw new UnauthorizedException('Sesión inválida o expirada');
      }
      request.userId = userId;
      return true;
    }

    if (authRequired()) {
      throw new UnauthorizedException('Falta el token de sesión');
    }

    request.userId = MVP_USER_ID;
    return true;
  }
}

/** `Bearer abc` → `abc`. Devuelve null si el header falta o no tiene ese formato. */
function extractBearer(header: string | undefined): string | null {
  if (!header) return null;
  const [scheme, value] = header.split(' ');
  return scheme?.toLowerCase() === 'bearer' && value ? value : null;
}
