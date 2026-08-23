import { BadRequestException, Inject, Injectable } from '@nestjs/common';

import { parseDay, startOfWeek, toDayString, weekDays } from '../../domain/week';
import type { WeekPlanView } from '../planning.types';
import {
  PLANNED_OUTFIT_REPOSITORY,
  type PlannedOutfitRepository,
} from '../repositories/planned-outfit.repository.interface';
import { PlanHydrationService } from '../services/plan-hydration.service';

/**
 * Devuelve la semana completa (lunes→domingo) con lo planeado en cada día. Es la fuente de
 * datos del **home** de la app: siempre los 7 días, los libres con `plannedOutfit: null`.
 */
@Injectable()
export class GetWeekPlanUseCase {
  constructor(
    @Inject(PLANNED_OUTFIT_REPOSITORY)
    private readonly repository: PlannedOutfitRepository,
    private readonly hydration: PlanHydrationService,
  ) {}

  async execute(userId: string, start?: string): Promise<WeekPlanView> {
    const reference = start ? parseDay(start) : new Date();
    if (!reference) {
      throw new BadRequestException(`Fecha inválida: ${start}`);
    }

    // `start` puede ser cualquier día de la semana buscada; se normaliza al lunes.
    const weekStart = startOfWeek(reference);
    const days = weekDays(weekStart);
    const planned = await this.repository.findActiveBetween(
      userId,
      days[0],
      days[days.length - 1],
    );

    return {
      weekStart: toDayString(days[0]),
      weekEnd: toDayString(days[days.length - 1]),
      days: await this.hydration.hydrateDays(days, planned, userId),
    };
  }
}
