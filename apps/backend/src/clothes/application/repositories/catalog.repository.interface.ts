import { Category } from '../../domain/entities/category.entity';
import { Color } from '../../domain/entities/color.entity';
import { Occasion } from '../../domain/entities/occasion.entity';
import { Tag } from '../../domain/entities/tag.entity';

/**
 * Contrato de los catálogos propiedad de `clothes` (Category, Color, Occasion, Tag).
 * `clothes` es el dueño: valida referencias internamente y los expone vía endpoints.
 */
export interface CatalogRepository {
  // Categories (catálogo global, sólo lectura en MVP).
  listCategories(): Promise<Category[]>;
  findCategoryById(id: string): Promise<Category | null>;

  // Colors (catálogo global, sólo lectura en MVP).
  listColors(): Promise<Color[]>;
  findColorById(id: string): Promise<Color | null>;

  // Occasions: globales + propias del usuario.
  listOccasions(userId: string): Promise<Occasion[]>;
  findOccasionByName(name: string, userId: string): Promise<Occasion | null>;
  createOccasion(name: string, userId: string): Promise<Occasion>;
  /** Ids válidos (global o del usuario) de entre los dados. */
  findExistingOccasionIds(ids: string[], userId: string): Promise<string[]>;

  // Tags propias del usuario.
  listTags(userId: string, search?: string): Promise<Tag[]>;
  findTagByName(name: string, userId: string): Promise<Tag | null>;
  createTag(name: string, userId: string): Promise<Tag>;
  findExistingTagIds(ids: string[], userId: string): Promise<string[]>;
}

export const CATALOG_REPOSITORY = Symbol('CatalogRepository');
