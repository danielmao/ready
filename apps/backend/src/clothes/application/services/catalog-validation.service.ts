import { BadRequestException, Inject, Injectable } from '@nestjs/common';

import {
  CATALOG_REPOSITORY,
  type CatalogRepository,
} from '../repositories/catalog.repository.interface';

/**
 * Lógica reutilizable entre create/update de prendas: validar que las referencias a catálogos
 * existen antes de persistir (no FK ciega). Servicio interno del dominio (no se exporta).
 */
@Injectable()
export class CatalogValidationService {
  constructor(
    @Inject(CATALOG_REPOSITORY)
    private readonly catalog: CatalogRepository,
  ) {}

  async assertCategoryExists(categoryId: string): Promise<void> {
    const category = await this.catalog.findCategoryById(categoryId);
    if (!category) {
      throw new BadRequestException(`Categoría inexistente: ${categoryId}`);
    }
  }

  async assertColorExists(colorId: string): Promise<void> {
    const color = await this.catalog.findColorById(colorId);
    if (!color) {
      throw new BadRequestException(`Color inexistente: ${colorId}`);
    }
  }

  async assertOccasionsExist(ids: string[], userId: string): Promise<void> {
    if (ids.length === 0) return;
    const found = await this.catalog.findExistingOccasionIds(ids, userId);
    this.assertAllFound(ids, found, 'Ocasión');
  }

  async assertTagsExist(ids: string[], userId: string): Promise<void> {
    if (ids.length === 0) return;
    const found = await this.catalog.findExistingTagIds(ids, userId);
    this.assertAllFound(ids, found, 'Etiqueta');
  }

  private assertAllFound(
    requested: string[],
    found: string[],
    label: string,
  ): void {
    const missing = requested.filter((id) => !found.includes(id));
    if (missing.length > 0) {
      throw new BadRequestException(
        `${label}(es) inexistente(s): ${missing.join(', ')}`,
      );
    }
  }
}
