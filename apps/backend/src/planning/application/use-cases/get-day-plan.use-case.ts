import { BadRequestException, Inject, Injectable } from '@nestjs/common';

import { parseDay, startOfDay } from '../../domain/week';
import type { DayPlanView } from '../planning.types';
import {
  PLANNED_OUTFIT_REPOSITORY,
  type PlannedOutfitRepository,
} from '../repositories/planned-outfit.repository.interface';
import { PlanHydrationService } from '../services/plan-hydration.service';

/**
 * Devuelve el plan de UN día, hidratado con el outfit y sus prendas (checklist de HU-05). Sin
 * `day` asume hoy en UTC — atajo para curl/monitoreo; la app manda siempre su día local.
 */
@Injectable()
export class GetDayPlanUseCase {
  constructor(
    @Inject(PLANNED_OUTFIT_REPOSITORY)
    private readonly repository: PlannedOutfitRepository,
    private readonly hydration: PlanHydrationService,
  ) {}

  async execute(userId: string, day?: string): Promise<DayPlanView> {
    const target = day ? parseDay(day) : startOfDay(new Date());
    if (!target) {
      throw new BadRequestException(`Fecha inválida: ${day}`);
    }

    const planned = await this.repository.findActiveByDay(userId, target);
    return this.hydration.hydrateDay(target, planned, userId);
  }
}
