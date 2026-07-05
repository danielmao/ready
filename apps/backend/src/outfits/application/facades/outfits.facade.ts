import { Inject, Injectable } from '@nestjs/common';

import { Outfit } from '../../domain/entities/outfit.entity';
import {
  OUTFIT_REPOSITORY,
  type OutfitRepository,
} from '../repositories/outfit.repository.interface';

/**
 * API pública del dominio `outfits` hacia otros dominios. Lo único que `OutfitsModule` exporta.
 * `planning` la consumirá para validar que el outfit a planear existe, está activo y es del
 * usuario antes de marcarlo como "próximo outfit". Nadie cruza por repos.
 */
@Injectable()
export class OutfitsFacade {
  constructor(
    @Inject(OUTFIT_REPOSITORY)
    private readonly repository: OutfitRepository,
  ) {}

  /** Outfit activo del usuario, o null. */
  findActiveOutfitById(id: string, userId: string): Promise<Outfit | null> {
    return this.repository.findActiveById(id, userId);
  }
}
