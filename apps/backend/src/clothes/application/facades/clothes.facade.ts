import { Inject, Injectable } from '@nestjs/common';

import { ClothingItem } from '../../domain/entities/clothing-item.entity';
import {
  CATALOG_REPOSITORY,
  type CatalogRepository,
} from '../repositories/catalog.repository.interface';
import {
  CLOTHING_ITEM_REPOSITORY,
  type ClothingItemRepository,
} from '../repositories/clothing-item.repository.interface';

/**
 * API pública del dominio `clothes` hacia otros dominios. Lo único que `ClothesModule` exporta.
 * `outfits` la consume para validar que cada `clothingItemId` existe, está activo y es del
 * usuario antes de componer un outfit, y que las occasions/tags referenciadas existen (los
 * catálogos son propiedad de `clothes`). Nadie cruza por repos (docs/02-ARCHITECTURE §3 bis).
 */
@Injectable()
export class ClothesFacade {
  constructor(
    @Inject(CLOTHING_ITEM_REPOSITORY)
    private readonly repository: ClothingItemRepository,
    @Inject(CATALOG_REPOSITORY)
    private readonly catalog: CatalogRepository,
  ) {}

  /** Prenda activa del usuario, o null. */
  findActiveItemById(id: string, userId: string): Promise<ClothingItem | null> {
    return this.repository.findActiveById(id, userId);
  }

  /**
   * De los ids dados, devuelve cuáles existen y están activos para el usuario.
   * El consumidor (outfits) compara contra los solicitados para decidir 400/404.
   */
  findExistingActiveItemIds(ids: string[], userId: string): Promise<string[]> {
    return this.repository.findExistingActiveIds(ids, userId);
  }

  /** Ids de ocasiones válidas (globales o del usuario) de entre las dadas. */
  findExistingOccasionIds(ids: string[], userId: string): Promise<string[]> {
    return this.catalog.findExistingOccasionIds(ids, userId);
  }

  /** Ids de etiquetas válidas del usuario de entre las dadas. */
  findExistingTagIds(ids: string[], userId: string): Promise<string[]> {
    return this.catalog.findExistingTagIds(ids, userId);
  }
}
