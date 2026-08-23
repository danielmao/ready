import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';

import { PlannedOutfit } from '../../domain/entities/planned-outfit.entity';
import { parseDay } from '../../domain/week';
import { ConfirmPlannedOutfitDto } from '../dtos/confirm-planned-outfit.dto';
import {
  PLANNED_OUTFIT_REPOSITORY,
  type PlannedOutfitRepository,
} from '../repositories/planned-outfit.repository.interface';

/**
 * Marca como `confirmed` el planeado de un día (HU-05: el usuario salió con ese outfit). Punto
 * de extensión: en Épica 2 esto generará un `OutfitHistory`.
 */
@Injectable()
export class ConfirmPlannedOutfitUseCase {
  constructor(
    @Inject(PLANNED_OUTFIT_REPOSITORY)
    private readonly repository: PlannedOutfitRepository,
  ) {}

  async execute(dto: ConfirmPlannedOutfitDto, userId: string): Promise<PlannedOutfit> {
    const day = parseDay(dto.day);
    if (!day) {
      throw new BadRequestException(`Fecha inválida: ${dto.day}`);
    }

    const active = await this.repository.findActiveByDay(userId, day);
    if (!active) {
      throw new NotFoundException(`No hay un outfit planeado para ${dto.day}`);
    }
    return this.repository.confirm(active.id);
  }
}
