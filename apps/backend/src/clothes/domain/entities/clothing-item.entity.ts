import { Category } from './category.entity';
import { Color } from './color.entity';
import { Occasion } from './occasion.entity';
import { Tag } from './tag.entity';

/**
 * Prenda del armario. Raíz del dominio `clothes`. Clase plana: sin framework ni Prisma.
 * Las relaciones (category/color/occasions/tags) se hidratan al leer; al crear/listar pueden
 * venir parciales según lo que el repositorio incluya.
 */
export class ClothingItem {
  id!: string;
  userId!: string;
  name!: string;
  categoryId!: string;
  colorId!: string;
  description?: string | null;
  imageUrls!: string[];
  isActive!: boolean;
  createdAt!: Date;
  updatedAt!: Date;

  category?: Category;
  color?: Color;
  occasions?: Occasion[];
  tags?: Tag[];

  constructor(data: Partial<ClothingItem> = {}) {
    Object.assign(this, data);
  }
}
