import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';

import { API_URL } from '../../../config/env';

/**
 * Login con Google, mediado por el backend.
 *
 * La app no habla con Google: abre una sesión de navegador contra nuestra API, que hace todo
 * el baile OAuth (código + PKCE + canje con el client secret) y devuelve al usuario por un
 * deep link con un JWT **nuestro**. Así el secret nunca vive en el bundle —donde cualquiera
 * podría extraerlo— y la app sigue corriendo en Expo Go, sin módulos nativos.
 *
 * `openAuthSessionAsync` usa la vista de autenticación del sistema (SFSafariViewController /
 * Custom Tabs), que comparte las cookies del navegador: si ya estás logueado en Google en el
 * teléfono, el login es un tap.
 */

/** El usuario cerró el navegador sin completar. No es un error a mostrar como falla. */
export class LoginCancelledError extends Error {
  constructor() {
    super('Login cancelado');
    this.name = 'LoginCancelledError';
  }
}

/** Devuelve el access token de Ready. Lanza si falla o si el usuario cancela. */
export async function signInWithGoogle(): Promise<string> {
  // En Expo Go: exp://<ip>:8081/--/auth · En build nativa: ready://auth (scheme de app.json).
  // El backend valida este destino contra su lista blanca antes de mandar el token.
  const redirectUri = Linking.createURL('auth');
  const authUrl = `${API_URL}/auth/google?redirect_uri=${encodeURIComponent(redirectUri)}`;

  const result = await WebBrowser.openAuthSessionAsync(authUrl, redirectUri);
  if (result.type !== 'success') {
    throw new LoginCancelledError();
  }

  const { queryParams } = Linking.parse(result.url);
  const error = queryParams?.error;
  if (typeof error === 'string') {
    throw new Error(describeError(error));
  }

  const token = queryParams?.token;
  if (typeof token !== 'string' || !token) {
    throw new Error('El servidor no devolvió una sesión válida.');
  }
  return token;
}

/** Traduce los códigos que devuelve el backend a algo que el usuario pueda entender. */
function describeError(code: string): string {
  switch (code) {
    case 'access_denied':
      return 'No autorizaste el acceso con Google.';
    case 'exchange_failed':
      return 'Google rechazó el ingreso. Probá de nuevo.';
    default:
      return 'No se pudo completar el ingreso. Probá de nuevo.';
  }
}
