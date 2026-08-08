import { BadRequestException, Inject, Injectable } from '@nestjs/common';

import { signAccessToken, verifyShortLived } from '../../../shared/auth/jwt';
import { UsersFacade } from '../../../users/application/facades/users.facade';
import {
  IDENTITY_PROVIDER,
  type IdentityProvider,
} from '../ports/identity-provider.interface';
import { buildAppCallbackUrl } from '../services/app-redirect.validator';
import type { LoginState } from './start-google-login.use-case';

/** Lo que llega en el callback de Google. `error` aparece si el usuario canceló. */
export interface GoogleCallbackInput {
  code?: string;
  state?: string;
  error?: string;
}

/**
 * Cierra el login: canjea el código, traduce la identidad de Google a un usuario de Ready y
 * emite **nuestro** access token. Devuelve el deep link al que hay que redirigir la app.
 *
 * Los errores posteriores a validar el `state` no explotan como 500: se devuelven por el
 * mismo deep link con `?error=...`, porque a esta altura el usuario está en el navegador y
 * dejarlo ahí varado sería el peor final posible. Sólo un `state` inválido corta en seco:
 * sin él no sabemos a qué app volver, y creerle a un `redirect_uri` sin firmar sería
 * exactamente el open redirect que el state existe para evitar.
 */
@Injectable()
export class CompleteGoogleLoginUseCase {
  constructor(
    @Inject(IDENTITY_PROVIDER) private readonly provider: IdentityProvider,
    private readonly users: UsersFacade,
  ) {}

  async execute(input: GoogleCallbackInput): Promise<string> {
    const state = input.state
      ? verifyShortLived<LoginState>(input.state)
      : null;
    if (!state) {
      throw new BadRequestException(
        'state inválido o expirado: reintentá el login desde la app',
      );
    }

    if (input.error || !input.code) {
      return buildAppCallbackUrl(state.redirectUri, {
        error: input.error ?? 'missing_code',
      });
    }

    try {
      const profile = await this.provider.exchangeCode({
        code: input.code,
        codeVerifier: state.codeVerifier,
      });
      const user = await this.users.resolveFromGoogle(profile);
      return buildAppCallbackUrl(state.redirectUri, {
        token: signAccessToken(user.id),
      });
    } catch {
      return buildAppCallbackUrl(state.redirectUri, {
        error: 'exchange_failed',
      });
    }
  }
}
