import { Injectable } from '@nestjs/common';

import { FindOrCreateByGoogleUseCase } from '../use-cases/find-or-create-by-google.use-case';

/**
 * Identidad verificada que el dominio `auth` le entrega a `users`. Se declara acá, en la
 * facade, y no en `users/domain`, para que el consumidor pueda tiparla sin importar el
 * interior de este dominio (boundary `cross-domain-only-via-facade`).
 */
export interface GoogleIdentityInput {
  googleId: string;
  email: string;
  name: string;
  photoUrl: string | null;
}

/** Lo mínimo que `auth` necesita saber del usuario resuelto: su id, para firmar el JWT. */
export interface ResolvedUser {
  id: string;
}

/**
 * API pública del dominio `users` hacia otros dominios. Lo único que `UsersModule` exporta.
 * Hoy la consume `auth`: tras verificar el id_token de Google necesita traducir esa identidad
 * a un usuario de Ready, sin conocer cómo se persisten ni cómo se vinculan las cuentas.
 */
@Injectable()
export class UsersFacade {
  constructor(
    private readonly findOrCreateByGoogle: FindOrCreateByGoogleUseCase,
  ) {}

  /** Usuario de Ready correspondiente a una identidad de Google (lo crea si no existía). */
  async resolveFromGoogle(
    identity: GoogleIdentityInput,
  ): Promise<ResolvedUser> {
    const user = await this.findOrCreateByGoogle.execute(identity);
    return { id: user.id };
  }
}
