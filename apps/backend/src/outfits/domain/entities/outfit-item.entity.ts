/**
 * Prenda embebida dentro de un outfit. Read-model propio de `outfits`: NO es la entidad
 * `ClothingItem` de `clothes` (los boundaries prohíben importar el dominio ajeno). El
 * repositorio la hidrata desde el join `outfit_items → clothing_items` al leer.
 */
export interface OutfitClothingItem {
  id: string;
  name: string;
  imageUrls: string[];
  category?: { id: string; name: string } | null;
  color?: { id: string; name: string; hexCode: string } | null;
}

/**
 * Ítem de un outfit: una prenda en una posición (`order`). Clase plana de dominio, sin
 * framework ni Prisma. `clothingItem` se hidrata al leer; al crear/actualizar sólo importan
 * `clothingItemId` y `order`.
 */
export class OutfitItem {
  id!: string;
  clothingItemId!: string;
  order!: number;

  clothingItem?: OutfitClothingItem;

  constructor(data: Partial<OutfitItem> = {}) {
    Object.assign(this, data);
  }
}
