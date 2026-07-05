import { Inject, Injectable, NotFoundException } from '@nestjs/common';

import { Outfit } from '../../domain/entities/outfit.entity';
import { UpdateOutfitDto } from '../dtos/update-outfit.dto';
import {
  OUTFIT_REPOSITORY,
  type OutfitRepository,
} from '../repositories/outfit.repository.interface';
import { OutfitValidationService } from '../services/outfit-validation.service';

/** Actualiza campos parciales de un outfit activo, validando lo que cambie. */
@Injectable()
export class UpdateOutfitUseCase {
  constructor(
    @Inject(OUTFIT_REPOSITORY)
    private readonly repository: OutfitRepository,
    private readonly validation: OutfitValidationService,
  ) {}

  async execute(
    id: string,
    dto: UpdateOutfitDto,
    userId: string,
  ): Promise<Outfit> {
    const existing = await this.repository.findActiveById(id, userId);
    if (!existing) {
      throw new NotFoundException(`Outfit inexistente: ${id}`);
    }

    if (dto.outfitItems) {
      await this.validation.assertItemsValid(dto.outfitItems, userId);
    }
    if (dto.occasionIds) {
      await this.validation.assertOccasionsExist(dto.occasionIds, userId);
    }
    if (dto.tagIds) {
      await this.validation.assertTagsExist(dto.tagIds, userId);
    }

    return this.repository.update(id, userId, {
      name: dto.name,
      items: dto.outfitItems?.map((i) => ({
        clothingItemId: i.clothingItemId,
        order: i.order,
      })),
      occasionIds: dto.occasionIds,
      tagIds: dto.tagIds,
    });
  }
}
