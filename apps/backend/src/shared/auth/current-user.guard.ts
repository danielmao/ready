import {
  type CanActivate,
  type ExecutionContext,
  Injectable,
} from '@nestjs/common';
import type { Request } from 'express';

/**
 * MVP single-user: no hay auth real. Este guard resuelve un `userId` fijo (el user sembrado,
 * env MVP_USER_ID) y lo deja en `request.userId` para que `@CurrentUser()` lo lea.
 *
 * El día que entre auth real (Épica 1), SÓLO cambia este guard: valida el JWT y resuelve el
 * userId desde el token. Los use-cases y controllers no se enteran — siguen recibiendo `userId`.
 */
export const MVP_USER_ID =
  process.env.MVP_USER_ID ?? '00000000-0000-0000-0000-000000000001';

@Injectable()
export class CurrentUserGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request & { userId?: string }>();
    request.userId = MVP_USER_ID;
    return true;
  }
}
