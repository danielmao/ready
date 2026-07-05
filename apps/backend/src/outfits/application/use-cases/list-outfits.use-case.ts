import { Inject, Injectable } from '@nestjs/common';

import type { Outfit } from '../../domain/entities/outfit.entity';
import type { Paginated } from '../../../shared/types/paginated';
import { ListOutfitsQuery } from '../dtos/list-outfits.query';
import {
  OUTFIT_REPOSITORY,
  type OutfitRepository,
} from '../repositories/outfit.repository.interface';

/** Lista los outfits activos del usuario con filtros (AND) y paginación offset. */
@Injectable()
export class ListOutfitsUseCase {
  constructor(
    @Inject(OUTFIT_REPOSITORY)
    private readonly repository: OutfitRepository,
  ) {}

  async execute(
    query: ListOutfitsQuery,
    userId: string,
  ): Promise<Paginated<Outfit>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    const { items, total } = await this.repository.findMany({
      userId,
      occasionId: query.occasionId,
      tagId: query.tagId,
      clothingId: query.clothingId,
      search: query.search,
      page,
      limit,
    });

    return { data: items, total, page, limit };
  }
}
