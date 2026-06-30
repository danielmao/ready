import { ClothingItem } from '../../domain/entities/clothing-item.entity';

/** Datos para crear una prenda (ya validados por el use-case). */
export interface NewClothingItem {
  userId: string;
  name: string;
  categoryId: string;
  colorId: string;
  description?: string | null;
  imageUrls: string[];
  occasionIds: string[];
  tagIds: string[];
}

/** Campos parciales para actualizar (sólo los presentes se modifican). */
export interface ClothingItemUpdate {
  name?: string;
  categoryId?: string;
  colorId?: string;
  description?: string | null;
  imageUrls?: string[];
  occasionIds?: string[];
  tagIds?: string[];
}

/** Filtros + paginación para listar prendas activas. */
export interface ClothingItemFilters {
  userId: string;
  categoryId?: string;
  colorId?: string;
  occasionId?: string;
  tagId?: string;
  search?: string;
  page: number;
  limit: number;
}

/**
 * Contrato del repositorio de prendas. Lo define `application` (no conoce Prisma); lo
 * implementa `infrastructure/persistence`. Tipos en entidades de dominio, nunca modelos Prisma.
 */
export interface ClothingItemRepository {
  create(data: NewClothingItem): Promise<ClothingItem>;
  findActiveById(id: string, userId: string): Promise<ClothingItem | null>;
  findMany(
    filters: ClothingItemFilters,
  ): Promise<{ items: ClothingItem[]; total: number }>;
  update(
    id: string,
    userId: string,
    data: ClothingItemUpdate,
  ): Promise<ClothingItem>;
  archive(id: string, userId: string): Promise<void>;
  /** Devuelve, de los ids dados, cuáles existen y están activos para el usuario. */
  findExistingActiveIds(ids: string[], userId: string): Promise<string[]>;
}

export const CLOTHING_ITEM_REPOSITORY = Symbol('ClothingItemRepository');
