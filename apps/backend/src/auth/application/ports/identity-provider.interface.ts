import { GoogleProfile } from '../../domain/entities/google-profile.entity';

/** Datos para armar la URL a la que mandamos al usuario a autenticarse en Google. */
export interface AuthorizationUrlInput {
  /** `state` firmado: vuelve intacto en el callback y ata las dos mitades del flujo. */
  state: string;
  /** Challenge PKCE (S256) derivado del verifier que guardamos dentro del state. */
  codeChallenge: string;
}

/** Datos para canjear el `code` del callback por la identidad del usuario. */
export interface ExchangeCodeInput {
  code: string;
  codeVerifier: string;
}

/**
 * Puerto hacia el proveedor de identidad (Google). `application` lo define en términos de
 * "mandá al usuario a autenticarse" y "canjeá este código por un perfil"; la implementación
 * concreta —google-auth-library, endpoints OAuth, verificación de firma del id_token— vive
 * en `infrastructure`. Esto permite testear los use-cases sin red.
 */
export interface IdentityProvider {
  buildAuthorizationUrl(input: AuthorizationUrlInput): string;
  /** Canjea el código. Lanza si el código es inválido o si el email no está verificado. */
  exchangeCode(input: ExchangeCodeInput): Promise<GoogleProfile>;
}

export const IDENTITY_PROVIDER = Symbol('IdentityProvider');
