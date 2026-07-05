import { Outfit } from '../../domain/entities/outfit.entity';

/** Una prenda posicionada dentro del outfit (ya validada por el use-case). */
export interface OutfitItemInput {
  clothingItemId: string;
  order: number;
}

/** Datos para crear un outfit (ya validados por el use-case). */
export interface NewOutfit {
  userId: string;
  name: string;
  items: OutfitItemInput[];
  occasionIds: string[];
  tagIds: string[];
}

/** Campos parciales para actualizar (sólo los presentes se modifican). */
export interface OutfitUpdate {
  name?: string;
  items?: OutfitItemInput[];
  occasionIds?: string[];
  tagIds?: string[];
}

/** Filtros + paginación para listar outfits activos. */
export interface OutfitFilters {
  userId: string;
  occasionId?: string;
  tagId?: string;
  clothingId?: string;
  search?: string;
  page: number;
  limit: number;
}

/**
 * Contrato del repositorio de outfits. Lo define `application` (no conoce Prisma); lo
 * implementa `infrastructure/persistence`. Tipos en entidades de dominio, nunca modelos Prisma.
 */
export interface OutfitRepository {
  create(data: NewOutfit): Promise<Outfit>;
  findActiveById(id: string, userId: string): Promise<Outfit | null>;
  findMany(filters: OutfitFilters): Promise<{ items: Outfit[]; total: number }>;
  update(id: string, userId: string, data: OutfitUpdate): Promise<Outfit>;
  archive(id: string, userId: string): Promise<void>;
}

export const OUTFIT_REPOSITORY = Symbol('OutfitRepository');
