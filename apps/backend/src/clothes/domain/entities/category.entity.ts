/** Catálogo. Clase plana de dominio: sin decoradores ni imports de framework/Prisma. */
export class Category {
  id!: string;
  name!: string;
  icon?: string | null;
  parentCategoryId?: string | null;

  constructor(data: Partial<Category> = {}) {
    Object.assign(this, data);
  }
}
