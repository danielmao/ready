/**
 * GoogleProfile: la identidad que Google afirma —y que ya verificamos— sobre quien acaba de
 * loguearse. Es el objeto de valor central de `auth`: todo el flujo OAuth existe para
 * producirlo. Clase plana, sin framework.
 */
export class GoogleProfile {
  /** Claim `sub` del id_token: identificador estable de la cuenta de Google. */
  googleId!: string;
  email!: string;
  name!: string;
  photoUrl!: string | null;

  constructor(data: Partial<GoogleProfile> = {}) {
    Object.assign(this, data);
  }
}
