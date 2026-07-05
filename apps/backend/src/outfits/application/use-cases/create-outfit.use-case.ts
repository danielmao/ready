import { Inject, Injectable } from '@nestjs/common';

import { Outfit } from '../../domain/entities/outfit.entity';
import { CreateOutfitDto } from '../dtos/create-outfit.dto';
import {
  OUTFIT_REPOSITORY,
  type OutfitRepository,
} from '../repositories/outfit.repository.interface';
import { OutfitValidationService } from '../services/outfit-validation.service';

/** Crea un outfit validando primero que sus prendas y etiquetas sean válidas. */
@Injectable()
export class CreateOutfitUseCase {
  constructor(
    @Inject(OUTFIT_REPOSITORY)
    private readonly repository: OutfitRepository,
    private readonly validation: OutfitValidationService,
  ) {}

  async execute(dto: CreateOutfitDto, userId: string): Promise<Outfit> {
    const occasionIds = dto.occasionIds ?? [];
    const tagIds = dto.tagIds ?? [];

    await this.validation.assertItemsValid(dto.outfitItems, userId);
    await this.validation.assertOccasionsExist(occasionIds, userId);
    await this.validation.assertTagsExist(tagIds, userId);

    return this.repository.create({
      userId,
      name: dto.name,
      items: dto.outfitItems.map((i) => ({
        clothingItemId: i.clothingItemId,
        order: i.order,
      })),
      occasionIds,
      tagIds,
    });
  }
}
