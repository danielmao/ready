import { OutfitItem } from './outfit-item.entity';

/** Ocasión/etiqueta embebida en un outfit (read-model plano; el catálogo vive en `clothes`). */
export interface OutfitLabel {
  id: string;
  name: string;
}

/**
 * Outfit: conjunto reutilizable de ≥2 prendas. Raíz del dominio `outfits`. Clase plana: sin
 * framework ni Prisma. `items`/`occasions`/`tags` se hidratan al leer; pueden venir parciales
 * según lo que el repositorio incluya.
 */
export class Outfit {
  id!: string;
  userId!: string;
  name!: string;
  isActive!: boolean;
  createdAt!: Date;
  updatedAt!: Date;

  items?: OutfitItem[];
  occasions?: OutfitLabel[];
  tags?: OutfitLabel[];

  constructor(data: Partial<Outfit> = {}) {
    Object.assign(this, data);
  }
}
