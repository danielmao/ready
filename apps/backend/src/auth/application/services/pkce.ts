import { createHash, randomBytes } from 'node:crypto';

/**
 * PKCE (RFC 7636). Ata el `code` que vuelve por el navegador a *esta* petición de login:
 * quien intercepte el código no puede canjearlo sin el `verifier`, que nunca sale del
 * backend (viaja firmado dentro del `state`).
 */

/** Secreto de un solo uso por intento de login. */
export function createCodeVerifier(): string {
  return randomBytes(32).toString('base64url');
}

/** Lo único que se le muestra a Google en la ida: el hash del verifier (método S256). */
export function toCodeChallenge(verifier: string): string {
  return createHash('sha256').update(verifier).digest('base64url');
}
