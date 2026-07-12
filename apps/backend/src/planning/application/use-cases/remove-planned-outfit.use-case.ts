import { Inject, Injectable, NotFoundException } from '@nestjs/common';

import {
  PLANNED_OUTFIT_REPOSITORY,
  type PlannedOutfitRepository,
} from '../repositories/planned-outfit.repository.interface';

/** Quita (cancela) el planeado activo del usuario. `DELETE /api/planning`. */
@Injectable()
export class RemovePlannedOutfitUseCase {
  constructor(
    @Inject(PLANNED_OUTFIT_REPOSITORY)
    private readonly repository: PlannedOutfitRepository,
  ) {}

  async execute(userId: string): Promise<{ success: true }> {
    const active = await this.repository.findActive(userId);
    if (!active) {
      throw new NotFoundException('No hay un outfit planeado activo');
    }
    await this.repository.cancelActive(userId);
    return { success: true };
  }
}
