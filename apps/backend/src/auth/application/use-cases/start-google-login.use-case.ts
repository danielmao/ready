import { BadRequestException, Inject, Injectable } from '@nestjs/common';

import { signShortLived } from '../../../shared/auth/jwt';
import {
  IDENTITY_PROVIDER,
  type IdentityProvider,
} from '../ports/identity-provider.interface';
import { isAllowedAppRedirect } from '../services/app-redirect.validator';
import { createCodeVerifier, toCodeChallenge } from '../services/pkce';

/**
 * Contenido del `state`. En vez de guardar el intento de login en memoria (que se perdería
 * al reiniciar el proceso y no sobreviviría a más de una instancia), todo lo que el callback
 * necesita viaja firmado en la propia URL: a dónde volver y con qué verifier canjear.
 */
export interface LoginState {
  redirectUri: string;
  codeVerifier: string;
}

/** Ventana para completar el login. Pasada, el `state` deja de validar. */
const STATE_TTL_SECONDS = 600;

/**
 * Arranca el login: valida a dónde nos pide la app que volvamos y arma la URL de Google.
 * No toca la base ni conoce usuarios — a esta altura no sabemos quién es el que entra.
 */
@Injectable()
export class StartGoogleLoginUseCase {
  constructor(
    @Inject(IDENTITY_PROVIDER) private readonly provider: IdentityProvider,
  ) {}

  execute(redirectUri: string): string {
    if (!isAllowedAppRedirect(redirectUri)) {
      throw new BadRequestException(
        'redirect_uri no permitido: agregalo a AUTH_ALLOWED_REDIRECTS',
      );
    }

    const codeVerifier = createCodeVerifier();
    const state = signShortLived(
      { redirectUri, codeVerifier } satisfies LoginState,
      STATE_TTL_SECONDS,
    );

    return this.provider.buildAuthorizationUrl({
      state,
      codeChallenge: toCodeChallenge(codeVerifier),
    });
  }
}
