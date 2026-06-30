import { Inject, Injectable } from '@nestjs/common';

import { ClothingItem } from '../../domain/entities/clothing-item.entity';
import {
  CLOTHING_ITEM_REPOSITORY,
  type ClothingItemRepository,
} from '../repositories/clothing-item.repository.interface';

/**
 * API pública del dominio `clothes` hacia otros dominios. Lo único que `ClothesModule` exporta.
 * `outfits` la consumirá para validar que cada `clothingItemId` existe, está activo y es del
 * usuario antes de componer un outfit (docs/02-ARCHITECTURE §3 bis). Nadie cruza por repos.
 */
@Injectable()
export class ClothesFacade {
  constructor(
    @Inject(CLOTHING_ITEM_REPOSITORY)
    private readonly repository: ClothingItemRepository,
  ) {}

  /** Prenda activa del usuario, o null. */
  findActiveItemById(id: string, userId: string): Promise<ClothingItem | null> {
    return this.repository.findActiveById(id, userId);
  }

  /**
   * De los ids dados, devuelve cuáles existen y están activos para el usuario.
   * El consumidor (outfits) compara contra los solicitados para decidir 400/404.
   */
  findExistingActiveItemIds(
    ids: string[],
    userId: string,
  ): Promise<string[]> {
    return this.repository.findExistingActiveIds(ids, userId);
  }
}
