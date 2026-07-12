import { Inject, Injectable, NotFoundException } from '@nestjs/common';

import { OutfitsFacade } from '../../../outfits/application/facades/outfits.facade';
import { UpdatePlannedOutfitDto } from '../dtos/update-planned-outfit.dto';
import type { PlanningView } from '../planning.types';
import {
  PLANNED_OUTFIT_REPOSITORY,
  type PlannedOutfitRepository,
} from '../repositories/planned-outfit.repository.interface';

/** Actualiza el planeado activo (cambiar el outfit fijado y/o su `plannedFor`). */
@Injectable()
export class UpdatePlannedOutfitUseCase {
  constructor(
    @Inject(PLANNED_OUTFIT_REPOSITORY)
    private readonly repository: PlannedOutfitRepository,
    private readonly outfits: OutfitsFacade,
  ) {}

  async execute(
    dto: UpdatePlannedOutfitDto,
    userId: string,
  ): Promise<PlanningView> {
    const active = await this.repository.findActive(userId);
    if (!active) {
      throw new NotFoundException('No hay un outfit planeado activo');
    }

    if (dto.outfitId) {
      const target = await this.outfits.findActiveOutfitById(
        dto.outfitId,
        userId,
      );
      if (!target) {
        throw new NotFoundException(`Outfit inexistente: ${dto.outfitId}`);
      }
    }

    const plannedOutfit = await this.repository.update(active.id, {
      outfitId: dto.outfitId,
      plannedFor:
        dto.plannedFor !== undefined
          ? dto.plannedFor
            ? new Date(dto.plannedFor)
            : null
          : undefined,
    });

    const outfit = await this.outfits.findActiveOutfitById(
      plannedOutfit.outfitId,
      userId,
    );
    return { plannedOutfit, outfit, items: outfit?.items ?? [] };
  }
}
