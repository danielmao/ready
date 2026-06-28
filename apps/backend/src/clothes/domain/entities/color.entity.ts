/** Catálogo. Clase plana de dominio. */
export class Color {
  id!: string;
  name!: string;
  hexCode!: string;

  constructor(data: Partial<Color> = {}) {
    Object.assign(this, data);
  }
}
