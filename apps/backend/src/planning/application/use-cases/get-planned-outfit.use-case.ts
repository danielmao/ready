import { Inject, Injectable } from '@nestjs/common';

import { OutfitsFacade } from '../../../outfits/application/facades/outfits.facade';
import type { PlanningView } from '../planning.types';
import {
  PLANNED_OUTFIT_REPOSITORY,
  type PlannedOutfitRepository,
} from '../repositories/planned-outfit.repository.interface';

/**
 * Devuelve el próximo outfit activo del usuario, hidratado con el outfit y sus prendas. Si no
 * hay planeado, devuelve la vista vacía (`{ plannedOutfit: null, outfit: null, items: [] }`).
 */
@Injectable()
export class GetPlannedOutfitUseCase {
  constructor(
    @Inject(PLANNED_OUTFIT_REPOSITORY)
    private readonly repository: PlannedOutfitRepository,
    private readonly outfits: OutfitsFacade,
  ) {}

  async execute(userId: string): Promise<PlanningView> {
    const plannedOutfit = await this.repository.findActive(userId);
    if (!plannedOutfit) {
      return { plannedOutfit: null, outfit: null, items: [] };
    }

    const outfit = await this.outfits.findActiveOutfitById(
      plannedOutfit.outfitId,
      userId,
    );
    return { plannedOutfit, outfit, items: outfit?.items ?? [] };
  }
}
