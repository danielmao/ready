import { Inject, Injectable, NotFoundException } from '@nestjs/common';

import { PlannedOutfit } from '../../domain/entities/planned-outfit.entity';
import {
  PLANNED_OUTFIT_REPOSITORY,
  type PlannedOutfitRepository,
} from '../repositories/planned-outfit.repository.interface';

/**
 * Marca el planeado activo como `confirmed` (HU-05: el usuario salió con el outfit). Punto de
 * extensión: en Épica 2 esto generará un `OutfitHistory`.
 */
@Injectable()
export class ConfirmPlannedOutfitUseCase {
  constructor(
    @Inject(PLANNED_OUTFIT_REPOSITORY)
    private readonly repository: PlannedOutfitRepository,
  ) {}

  async execute(userId: string): Promise<PlannedOutfit> {
    const active = await this.repository.findActive(userId);
    if (!active) {
      throw new NotFoundException('No hay un outfit planeado activo');
    }
    return this.repository.confirm(active.id);
  }
}
