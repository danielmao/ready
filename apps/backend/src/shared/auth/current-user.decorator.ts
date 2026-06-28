import { createParamDecorator, type ExecutionContext } from '@nestjs/common';
import type { Request } from 'express';

/**
 * Inyecta el `userId` resuelto por CurrentUserGuard en los handlers del controller:
 *
 *   create(@CurrentUser() userId: string, @Body() dto: CreateClothingItemDto) { ... }
 *
 * Mantiene los controllers ignorantes de cómo se obtiene el usuario (hoy fijo, mañana JWT).
 */
export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): string => {
    const request = ctx
      .switchToHttp()
      .getRequest<Request & { userId?: string }>();
    return request.userId ?? '';
  },
);
