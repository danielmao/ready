import { Inject, Injectable, NotFoundException } from '@nestjs/common';

import { ClothingItem } from '../../domain/entities/clothing-item.entity';
import {
  CLOTHING_ITEM_REPOSITORY,
  type ClothingItemRepository,
} from '../repositories/clothing-item.repository.interface';

/** Devuelve una prenda activa del usuario con sus relaciones; 404 si no existe/archivada. */
@Injectable()
export class GetClothingItemUseCase {
  constructor(
    @Inject(CLOTHING_ITEM_REPOSITORY)
    private readonly repository: ClothingItemRepository,
  ) {}

  async execute(id: string, userId: string): Promise<ClothingItem> {
    const item = await this.repository.findActiveById(id, userId);
    if (!item) {
      throw new NotFoundException(`Prenda inexistente: ${id}`);
    }
    return item;
  }
}
