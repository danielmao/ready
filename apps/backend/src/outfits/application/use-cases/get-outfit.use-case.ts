import { Inject, Injectable, NotFoundException } from '@nestjs/common';

import { Outfit } from '../../domain/entities/outfit.entity';
import {
  OUTFIT_REPOSITORY,
  type OutfitRepository,
} from '../repositories/outfit.repository.interface';

/** Devuelve un outfit activo del usuario con sus relaciones; 404 si no existe/archivado. */
@Injectable()
export class GetOutfitUseCase {
  constructor(
    @Inject(OUTFIT_REPOSITORY)
    private readonly repository: OutfitRepository,
  ) {}

  async execute(id: string, userId: string): Promise<Outfit> {
    const outfit = await this.repository.findActiveById(id, userId);
    if (!outfit) {
      throw new NotFoundException(`Outfit inexistente: ${id}`);
    }
    return outfit;
  }
}
