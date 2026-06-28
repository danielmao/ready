import { Inject, Injectable, NotFoundException } from '@nestjs/common';

import { ClothingItem } from '../../domain/entities/clothing-item.entity';
import { UpdateClothingItemDto } from '../dtos/update-clothing-item.dto';
import {
  CLOTHING_ITEM_REPOSITORY,
  type ClothingItemRepository,
} from '../repositories/clothing-item.repository.interface';
import { CatalogValidationService } from '../services/catalog-validation.service';

/** Actualiza campos parciales de una prenda activa, validando catálogos que cambien. */
@Injectable()
export class UpdateClothingItemUseCase {
  constructor(
    @Inject(CLOTHING_ITEM_REPOSITORY)
    private readonly repository: ClothingItemRepository,
    private readonly catalogValidation: CatalogValidationService,
  ) {}

  async execute(
    id: string,
    dto: UpdateClothingItemDto,
    userId: string,
  ): Promise<ClothingItem> {
    const existing = await this.repository.findActiveById(id, userId);
    if (!existing) {
      throw new NotFoundException(`Prenda inexistente: ${id}`);
    }

    if (dto.categoryId) {
      await this.catalogValidation.assertCategoryExists(dto.categoryId);
    }
    if (dto.colorId) {
      await this.catalogValidation.assertColorExists(dto.colorId);
    }
    if (dto.occasionIds) {
      await this.catalogValidation.assertOccasionsExist(dto.occasionIds, userId);
    }
    if (dto.tagIds) {
      await this.catalogValidation.assertTagsExist(dto.tagIds, userId);
    }

    return this.repository.update(id, userId, {
      name: dto.name,
      categoryId: dto.categoryId,
      colorId: dto.colorId,
      description: dto.description,
      imageUrls: dto.imageUrls,
      occasionIds: dto.occasionIds,
      tagIds: dto.tagIds,
    });
  }
}
