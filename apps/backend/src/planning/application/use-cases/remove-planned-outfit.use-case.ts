import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';

import { parseDay } from '../../domain/week';
import {
  PLANNED_OUTFIT_REPOSITORY,
  type PlannedOutfitRepository,
} from '../repositories/planned-outfit.repository.interface';

/** Libera un día del plan: cancela su planeado activo. `DELETE /api/planning/:day`. */
@Injectable()
export class RemovePlannedOutfitUseCase {
  constructor(
    @Inject(PLANNED_OUTFIT_REPOSITORY)
    private readonly repository: PlannedOutfitRepository,
  ) {}

  async execute(userId: string, day: string): Promise<{ success: true }> {
    const target = parseDay(day);
    if (!target) {
      throw new BadRequestException(`Fecha inválida: ${day}`);
    }

    const active = await this.repository.findActiveByDay(userId, target);
    if (!active) {
      throw new NotFoundException(`No hay un outfit planeado para ${day}`);
    }
    await this.repository.cancelDay(userId, target);
    return { success: true };
  }
}
