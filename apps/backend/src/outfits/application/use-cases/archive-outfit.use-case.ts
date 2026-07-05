import { Inject, Injectable, NotFoundException } from '@nestjs/common';

import {
  OUTFIT_REPOSITORY,
  type OutfitRepository,
} from '../repositories/outfit.repository.interface';

/** Archivado lógico (isActive=false), no borrado físico. DELETE /api/outfits/:id. */
@Injectable()
export class ArchiveOutfitUseCase {
  constructor(
    @Inject(OUTFIT_REPOSITORY)
    private readonly repository: OutfitRepository,
  ) {}

  async execute(id: string, userId: string): Promise<{ success: true }> {
    const existing = await this.repository.findActiveById(id, userId);
    if (!existing) {
      throw new NotFoundException(`Outfit inexistente: ${id}`);
    }
    await this.repository.archive(id, userId);
    return { success: true };
  }
}
