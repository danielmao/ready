import { Inject, Injectable, NotFoundException } from '@nestjs/common';

import { OutfitsFacade } from '../../../outfits/application/facades/outfits.facade';
import { SetPlannedOutfitDto } from '../dtos/set-planned-outfit.dto';
import type { PlanningView } from '../planning.types';
import {
  PLANNED_OUTFIT_REPOSITORY,
  type PlannedOutfitRepository,
} from '../repositories/planned-outfit.repository.interface';

/**
 * Fija un outfit como el próximo. Valida —vía `OutfitsFacade`, único cruce permitido a
 * `outfits`— que exista, esté activo y sea del usuario, y delega en el repo la cancelación
 * atómica del planeado anterior (invariante "un solo activo").
 */
@Injectable()
export class SetPlannedOutfitUseCase {
  constructor(
    @Inject(PLANNED_OUTFIT_REPOSITORY)
    private readonly repository: PlannedOutfitRepository,
    private readonly outfits: OutfitsFacade,
  ) {}

  async execute(dto: SetPlannedOutfitDto, userId: string): Promise<PlanningView> {
    const outfit = await this.outfits.findActiveOutfitById(dto.outfitId, userId);
    if (!outfit) {
      throw new NotFoundException(`Outfit inexistente: ${dto.outfitId}`);
    }

    const plannedOutfit = await this.repository.create({
      userId,
      outfitId: dto.outfitId,
      plannedFor: dto.plannedFor ? new Date(dto.plannedFor) : null,
    });

    return { plannedOutfit, outfit, items: outfit.items ?? [] };
  }
}
