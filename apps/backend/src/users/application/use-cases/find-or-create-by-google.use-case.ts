import { Inject, Injectable } from '@nestjs/common';

import { User } from '../../domain/entities/user.entity';
import {
  type GoogleIdentity,
  USER_REPOSITORY,
  type UserRepository,
} from '../repositories/user.repository.interface';

/**
 * Resuelve el usuario de Ready a partir de una identidad de Google ya verificada. Es el
 * punto donde una cuenta de Google se convierte en un `User.id` nuestro.
 *
 * Tres casos, en orden:
 * 1. Ya vino antes → match por `googleId`.
 * 2. Primera vez, pero el email ya existe → se **vincula** la identidad a ese usuario. Esto
 *    es lo que hace que el usuario sembrado del MVP (con su armario cargado) sea el mismo
 *    que entra por Google, en vez de aparecer una cuenta nueva y vacía.
 * 3. Nadie con ese email → alta.
 *
 * Confiar en el email para vincular es seguro acá porque Google ya validó que es suyo
 * (`email_verified`, chequeado al verificar el id_token) y es el único IdP admitido.
 */
@Injectable()
export class FindOrCreateByGoogleUseCase {
  constructor(
    @Inject(USER_REPOSITORY) private readonly repository: UserRepository,
  ) {}

  async execute(identity: GoogleIdentity): Promise<User> {
    const byGoogleId = await this.repository.findByGoogleId(identity.googleId);
    if (byGoogleId) return byGoogleId;

    const byEmail = await this.repository.findByEmail(identity.email);
    if (byEmail) return this.repository.linkGoogleId(byEmail.id, identity);

    return this.repository.createFromGoogle(identity);
  }
}
