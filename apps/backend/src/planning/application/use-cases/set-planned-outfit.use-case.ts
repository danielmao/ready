import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';

import { OutfitsFacade } from '../../../outfits/application/facades/outfits.facade';
import { parseDay } from '../../domain/week';
import { SetPlannedOutfitDto } from '../dtos/set-planned-outfit.dto';
import type { DayPlanView } from '../planning.types';
import {
  PLANNED_OUTFIT_REPOSITORY,
  type PlannedOutfitRepository,
} from '../repositories/planned-outfit.repository.interface';
import { PlanHydrationService } from '../services/plan-hydration.service';

/**
 * Planea un outfit para un día de la semana. Valida —vía `OutfitsFacade`, único cruce permitido
 * a `outfits`— que exista, esté activo y sea del usuario, y delega en el repo la cancelación
 * atómica de lo que hubiera en ESE día (invariante "un solo activo por día"). El resto de la
 * semana no se toca.
 */
@Injectable()
export class SetPlannedOutfitUseCase {
  constructor(
    @Inject(PLANNED_OUTFIT_REPOSITORY)
    private readonly repository: PlannedOutfitRepository,
    private readonly outfits: OutfitsFacade,
    private readonly hydration: PlanHydrationService,
  ) {}

  async execute(dto: SetPlannedOutfitDto, userId: string): Promise<DayPlanView> {
    const day = parseDay(dto.day);
    if (!day) {
      throw new BadRequestException(`Fecha inválida: ${dto.day}`);
    }

    const outfit = await this.outfits.findActiveOutfitById(dto.outfitId, userId);
    if (!outfit) {
      throw new NotFoundException(`Outfit inexistente: ${dto.outfitId}`);
    }

    const plannedOutfit = await this.repository.create({
      userId,
      outfitId: dto.outfitId,
      plannedFor: day,
    });

    return this.hydration.hydrateDay(day, plannedOutfit, userId);
  }
}
