import { Injectable, UnauthorizedException } from '@nestjs/common';
import { OAuth2Client } from 'google-auth-library';

import type {
  AuthorizationUrlInput,
  ExchangeCodeInput,
  IdentityProvider,
} from '../../application/ports/identity-provider.interface';
import { GoogleProfile } from '../../domain/entities/google-profile.entity';

/** Lo mínimo que pedimos: quién sos (openid/email) y cómo te llamás y tu foto (profile). */
const SCOPES = ['openid', 'email', 'profile'];

/**
 * Adaptador real del puerto `IdentityProvider`, sobre google-auth-library.
 *
 * El cliente OAuth es de tipo **Aplicación web** (no iOS/Android): el intercambio del código
 * ocurre acá, servidor a servidor, y el `client_secret` nunca sale del backend. Ver la
 * decisión completa en docs/02-ARCHITECTURE.md (ADR de auth).
 */
@Injectable()
export class GoogleIdentityProvider implements IdentityProvider {
  /**
   * Se construye por llamada y no en el constructor de Nest para que el módulo pueda
   * levantar aunque el env todavía no esté configurado: sin credenciales falla el login,
   * no el arranque de toda la API.
   */
  private client(): OAuth2Client {
    const clientId = requireEnv('GOOGLE_CLIENT_ID');
    const clientSecret = requireEnv('GOOGLE_CLIENT_SECRET');
    const redirectUri = requireEnv('GOOGLE_REDIRECT_URI');
    return new OAuth2Client({ clientId, clientSecret, redirectUri });
  }

  buildAuthorizationUrl({
    state,
    codeChallenge,
  }: AuthorizationUrlInput): string {
    return this.client().generateAuthUrl({
      scope: SCOPES,
      state,
      code_challenge_method: 'S256' as never,
      code_challenge: codeChallenge,
      // Fuerza el selector de cuenta: sin esto, Google reusa en silencio la sesión del
      // navegador y cambiar de usuario se vuelve imposible desde la app.
      prompt: 'select_account',
    });
  }

  async exchangeCode({
    code,
    codeVerifier,
  }: ExchangeCodeInput): Promise<GoogleProfile> {
    const client = this.client();
    const { tokens } = await client.getToken({ code, codeVerifier });
    if (!tokens.id_token) {
      throw new UnauthorizedException('Google no devolvió id_token');
    }

    // Verifica firma, emisor, expiración y que el token haya sido emitido PARA nuestro
    // client_id. Sin este chequeo de audiencia, un id_token de otra app sería aceptado.
    const ticket = await client.verifyIdToken({
      idToken: tokens.id_token,
      audience: requireEnv('GOOGLE_CLIENT_ID'),
    });
    const payload = ticket.getPayload();

    if (!payload?.sub || !payload.email) {
      throw new UnauthorizedException('id_token sin sub o email');
    }
    // Un email no verificado no sirve para vincular cuentas por email (ver
    // FindOrCreateByGoogleUseCase): permitiría reclamar la cuenta de otro.
    if (!payload.email_verified) {
      throw new UnauthorizedException('El email de Google no está verificado');
    }

    return new GoogleProfile({
      googleId: payload.sub,
      email: payload.email,
      name: payload.name ?? payload.email,
      photoUrl: payload.picture ?? null,
    });
  }
}

/** Falla ruidosamente: una credencial OAuth ausente debe verse, no degradar en silencio. */
function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `Falta ${name}: el login con Google no puede funcionar sin él.`,
    );
  }
  return value;
}
