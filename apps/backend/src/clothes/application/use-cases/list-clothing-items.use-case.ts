import { Inject, Injectable } from '@nestjs/common';

import type { ClothingItem } from '../../domain/entities/clothing-item.entity';
import type { Paginated } from '../../../shared/types/paginated';
import { ListClothingItemsQuery } from '../dtos/list-clothing-items.query';
import {
  CLOTHING_ITEM_REPOSITORY,
  type ClothingItemRepository,
} from '../repositories/clothing-item.repository.interface';

/** Lista las prendas activas del usuario con filtros (AND) y paginación offset. */
@Injectable()
export class ListClothingItemsUseCase {
  constructor(
    @Inject(CLOTHING_ITEM_REPOSITORY)
    private readonly repository: ClothingItemRepository,
  ) {}

  async execute(
    query: ListClothingItemsQuery,
    userId: string,
  ): Promise<Paginated<ClothingItem>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    const { items, total } = await this.repository.findMany({
      userId,
      categoryId: query.categoryId,
      colorId: query.colorId,
      occasionId: query.occasionId,
      tagId: query.tagId,
      search: query.search,
      page,
      limit,
    });

    return { data: items, total, page, limit };
  }
}
