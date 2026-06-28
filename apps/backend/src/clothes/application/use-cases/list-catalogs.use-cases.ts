import { Inject, Injectable } from '@nestjs/common';

import type { Category } from '../../domain/entities/category.entity';
import type { Color } from '../../domain/entities/color.entity';
import type { Occasion } from '../../domain/entities/occasion.entity';
import type { Tag } from '../../domain/entities/tag.entity';
import {
  CATALOG_REPOSITORY,
  type CatalogRepository,
} from '../repositories/catalog.repository.interface';

/** Catálogo de categorías (global). */
@Injectable()
export class ListCategoriesUseCase {
  constructor(
    @Inject(CATALOG_REPOSITORY) private readonly catalog: CatalogRepository,
  ) {}

  execute(): Promise<Category[]> {
    return this.catalog.listCategories();
  }
}

/** Catálogo de colores (global). */
@Injectable()
export class ListColorsUseCase {
  constructor(
    @Inject(CATALOG_REPOSITORY) private readonly catalog: CatalogRepository,
  ) {}

  execute(): Promise<Color[]> {
    return this.catalog.listColors();
  }
}

/** Ocasiones visibles para el usuario (globales + propias). */
@Injectable()
export class ListOccasionsUseCase {
  constructor(
    @Inject(CATALOG_REPOSITORY) private readonly catalog: CatalogRepository,
  ) {}

  execute(userId: string): Promise<Occasion[]> {
    return this.catalog.listOccasions(userId);
  }
}

/** Tags propias del usuario, con búsqueda opcional. */
@Injectable()
export class ListTagsUseCase {
  constructor(
    @Inject(CATALOG_REPOSITORY) private readonly catalog: CatalogRepository,
  ) {}

  execute(userId: string, search?: string): Promise<Tag[]> {
    return this.catalog.listTags(userId, search);
  }
}
