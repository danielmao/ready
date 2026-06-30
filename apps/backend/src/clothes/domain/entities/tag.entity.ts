/** Etiqueta creada por el usuario (o global si userId es null). Clase plana de dominio. */
export class Tag {
  id!: string;
  name!: string;
  userId?: string | null;

  constructor(data: Partial<Tag> = {}) {
    Object.assign(this, data);
  }
}
