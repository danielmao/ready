/**
 * Tipos espejo de las entidades del backend (apps/backend/src/clothes/domain/entities).
 * Mantener sincronizados con los contratos de docs/04-API-SPECIFICATION.md.
 */

export interface Category {
  id: string;
  name: string;
  icon?: string | null;
  parentCategoryId?: string | null;
}

export interface Color {
  id: string;
  name: string;
  hexCode: string;
}

export interface Occasion {
  id: string;
  name: string;
  icon?: string | null;
  isGlobal: boolean;
  userId?: string | null;
}

export interface Tag {
  id: string;
  name: string;
  userId?: string | null;
}

export interface ClothingItem {
  id: string;
  userId: string;
  name: string;
  categoryId: string;
  colorId: string;
  description?: string | null;
  imageUrls: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  category?: Category;
  color?: Color;
  occasions?: Occasion[];
  tags?: Tag[];
}

/** Body de POST /api/clothes (espejo de CreateClothingItemDto). */
export interface CreateClothingItemInput {
  name: string;
  categoryId: string;
  colorId: string;
  description?: string;
  occasionIds?: string[];
  tagIds?: string[];
  imageUrls?: string[];
}

/** Forma paginada de GET /api/clothes (espejo de Paginated<T>). */
export interface Paginated<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}
