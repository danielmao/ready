import { Inject, Injectable } from '@nestjs/common';

import { Tag } from '../../domain/entities/tag.entity';
import {
  CATALOG_REPOSITORY,
  type CatalogRepository,
} from '../repositories/catalog.repository.interface';

/**
 * Crea una tag del usuario. Idempotente: si ya existe una con ese nombre, la devuelve
 * (decisión de spec — no error 409).
 */
@Injectable()
export class CreateTagUseCase {
  constructor(
    @Inject(CATALOG_REPOSITORY) private readonly catalog: CatalogRepository,
  ) {}

  async execute(name: string, userId: string): Promise<Tag> {
    const existing = await this.catalog.findTagByName(name, userId);
    if (existing) return existing;
    return this.catalog.createTag(name, userId);
  }
}
