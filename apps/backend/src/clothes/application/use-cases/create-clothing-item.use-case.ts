import { Inject, Injectable } from '@nestjs/common';

import { ClothingItem } from '../../domain/entities/clothing-item.entity';
import { CreateClothingItemDto } from '../dtos/create-clothing-item.dto';
import {
  CLOTHING_ITEM_REPOSITORY,
  type ClothingItemRepository,
} from '../repositories/clothing-item.repository.interface';
import { CatalogValidationService } from '../services/catalog-validation.service';

/** Crea una prenda validando primero que sus referencias a catálogos existan. */
@Injectable()
export class CreateClothingItemUseCase {
  constructor(
    @Inject(CLOTHING_ITEM_REPOSITORY)
    private readonly repository: ClothingItemRepository,
    private readonly catalogValidation: CatalogValidationService,
  ) {}

  async execute(dto: CreateClothingItemDto, userId: string): Promise<ClothingItem> {
    const occasionIds = dto.occasionIds ?? [];
    const tagIds = dto.tagIds ?? [];

    await this.catalogValidation.assertCategoryExists(dto.categoryId);
    await this.catalogValidation.assertColorExists(dto.colorId);
    await this.catalogValidation.assertOccasionsExist(occasionIds, userId);
    await this.catalogValidation.assertTagsExist(tagIds, userId);

    return this.repository.create({
      userId,
      name: dto.name,
      categoryId: dto.categoryId,
      colorId: dto.colorId,
      description: dto.description ?? null,
      imageUrls: dto.imageUrls ?? [],
      occasionIds,
      tagIds,
    });
  }
}
