import { BadRequestException, Injectable } from '@nestjs/common';

import { ClothesFacade } from '../../../clothes/application/facades/clothes.facade';
import { OutfitItemDto } from '../dtos/outfit-item.dto';

/**
 * Lógica reutilizable entre create/update de outfits: validar la composición antes de
 * persistir. Cruza a `clothes` SÓLO vía `ClothesFacade` (nunca sus repos/tablas). Servicio
 * interno del dominio (no se exporta).
 */
@Injectable()
export class OutfitValidationService {
  constructor(private readonly clothes: ClothesFacade) {}

  /** ≥2 prendas, sin duplicados, todas activas y del usuario. */
  async assertItemsValid(items: OutfitItemDto[], userId: string): Promise<void> {
    if (items.length < 2) {
      throw new BadRequestException('Un outfit necesita al menos 2 prendas');
    }

    const ids = items.map((i) => i.clothingItemId);
    const unique = new Set(ids);
    if (unique.size !== ids.length) {
      throw new BadRequestException('Un outfit no puede repetir la misma prenda');
    }

    const existing = await this.clothes.findExistingActiveItemIds(ids, userId);
    this.assertAllFound(ids, existing, 'Prenda');
  }

  async assertOccasionsExist(ids: string[], userId: string): Promise<void> {
    if (ids.length === 0) return;
    const found = await this.clothes.findExistingOccasionIds(ids, userId);
    this.assertAllFound(ids, found, 'Ocasión');
  }

  async assertTagsExist(ids: string[], userId: string): Promise<void> {
    if (ids.length === 0) return;
    const found = await this.clothes.findExistingTagIds(ids, userId);
    this.assertAllFound(ids, found, 'Etiqueta');
  }

  private assertAllFound(
    requested: string[],
    found: string[],
    label: string,
  ): void {
    const missing = requested.filter((id) => !found.includes(id));
    if (missing.length > 0) {
      throw new BadRequestException(
        `${label}(s) inexistente(s) o no disponible(s): ${missing.join(', ')}`,
      );
    }
  }
}
