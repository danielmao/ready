import { Inject, Injectable, NotFoundException } from '@nestjs/common';

import {
  CLOTHING_ITEM_REPOSITORY,
  type ClothingItemRepository,
} from '../repositories/clothing-item.repository.interface';

/** Archivado lógico (isActive=false), no borrado físico. DELETE /api/clothes/:id. */
@Injectable()
export class ArchiveClothingItemUseCase {
  constructor(
    @Inject(CLOTHING_ITEM_REPOSITORY)
    private readonly repository: ClothingItemRepository,
  ) {}

  async execute(id: string, userId: string): Promise<{ success: true }> {
    const existing = await this.repository.findActiveById(id, userId);
    if (!existing) {
      throw new NotFoundException(`Prenda inexistente: ${id}`);
    }
    await this.repository.archive(id, userId);
    return { success: true };
  }
}
