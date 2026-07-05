/**
 * Tipos espejo de las entidades del backend (apps/backend/src/outfits/domain/entities).
 * Mantener sincronizados con los contratos de docs/04-API-SPECIFICATION.md.
 */

/** Etiqueta embebida en un outfit (ocasión / tag). */
export interface OutfitLabel {
  id: string;
  name: string;
}

/** Prenda embebida dentro de un ítem de outfit (read-model del backend). */
export interface OutfitClothingItem {
  id: string;
  name: string;
  imageUrls: string[];
  category?: { id: string; name: string } | null;
  color?: { id: string; name: string; hexCode: string } | null;
}

/** Ítem de un outfit: una prenda en una posición. */
export interface OutfitItem {
  id: string;
  clothingItemId: string;
  order: number;
  clothingItem?: OutfitClothingItem;
}

/** Outfit: conjunto reutilizable de ≥2 prendas. */
export interface Outfit {
  id: string;
  userId: string;
  name: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  items?: OutfitItem[];
  occasions?: OutfitLabel[];
  tags?: OutfitLabel[];
}

/** Una prenda posicionada, para el body de crear/editar. */
export interface OutfitItemInput {
  clothingItemId: string;
  order: number;
}

/** Body de POST /api/outfits (espejo de CreateOutfitDto). Mínimo 2 outfitItems. */
export interface CreateOutfitInput {
  name: string;
  outfitItems: OutfitItemInput[];
  occasionIds?: string[];
  tagIds?: string[];
}

/** Body de PUT /api/outfits/:id (espejo de UpdateOutfitDto). Update parcial. */
export type UpdateOutfitInput = Partial<CreateOutfitInput>;
