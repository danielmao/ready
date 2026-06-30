import { Inject, Injectable } from '@nestjs/common';

import { Occasion } from '../../domain/entities/occasion.entity';
import {
  CATALOG_REPOSITORY,
  type CatalogRepository,
} from '../repositories/catalog.repository.interface';

/**
 * Crea una ocasión propia del usuario. Idempotente: si ya existe (global o del usuario) una
 * con ese nombre, la devuelve.
 */
@Injectable()
export class CreateOccasionUseCase {
  constructor(
    @Inject(CATALOG_REPOSITORY) private readonly catalog: CatalogRepository,
  ) {}

  async execute(name: string, userId: string): Promise<Occasion> {
    const existing = await this.catalog.findOccasionByName(name, userId);
    if (existing) return existing;
    return this.catalog.createOccasion(name, userId);
  }
}
