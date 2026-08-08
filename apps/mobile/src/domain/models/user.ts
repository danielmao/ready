/** Perfil del usuario logueado, tal como lo devuelve `GET /api/users/me`. */
export interface User {
  id: string;
  email: string;
  name: string;
  photoUrl: string | null;
}
