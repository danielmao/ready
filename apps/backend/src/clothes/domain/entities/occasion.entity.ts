/** Ocasión global (catálogo) o propia del usuario. Clase plana de dominio. */
export class Occasion {
  id!: string;
  name!: string;
  icon?: string | null;
  isGlobal!: boolean;
  userId?: string | null;

  constructor(data: Partial<Occasion> = {}) {
    Object.assign(this, data);
  }
}
