import { Injectable } from '@nestjs/common';
import type { Prisma } from '@prisma/client';

import { PrismaService } from '../../../../shared/prisma/prisma.service';
import { Category } from '../../../domain/entities/category.entity';
import { ClothingItem } from '../../../domain/entities/clothing-item.entity';
import { Color } from '../../../domain/entities/color.entity';
import { Occasion } from '../../../domain/entities/occasion.entity';
import { Tag } from '../../../domain/entities/tag.entity';
import type {
  ClothingItemFilters,
  ClothingItemRepository,
  ClothingItemUpdate,
  NewClothingItem,
} from '../../../application/repositories/clothing-item.repository.interface';

/** Include estándar para hidratar una prenda con sus relaciones de dominio. */
const ITEM_INCLUDE = {
  category: true,
  color: true,
  occasions: { include: { occasion: true } },
  tags: { include: { tag: true } },
} satisfies Prisma.ClothingItemInclude;

type ItemRow = Prisma.ClothingItemGetPayload<{ include: typeof ITEM_INCLUDE }>;

/**
 * Implementación Prisma del contrato `ClothingItemRepository`. Único lugar autorizado a tocar
 * `@prisma/client` para este agregado; mapea modelo Prisma ↔ entidad de dominio.
 */
@Injectable()
export class PrismaClothingItemRepository implements ClothingItemRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: NewClothingItem): Promise<ClothingItem> {
    const row = await this.prisma.clothingItem.create({
      data: {
        userId: data.userId,
        name: data.name,
        categoryId: data.categoryId,
        colorId: data.colorId,
        description: data.description ?? null,
        imageUrls: data.imageUrls,
        occasions: { create: data.occasionIds.map((occasionId) => ({ occasionId })) },
        tags: { create: data.tagIds.map((tagId) => ({ tagId })) },
      },
      include: ITEM_INCLUDE,
    });
    return this.toEntity(row);
  }

  async findActiveById(id: string, userId: string): Promise<ClothingItem | null> {
    const row = await this.prisma.clothingItem.findFirst({
      where: { id, userId, isActive: true },
      include: ITEM_INCLUDE,
    });
    return row ? this.toEntity(row) : null;
  }

  async findMany(
    filters: ClothingItemFilters,
  ): Promise<{ items: ClothingItem[]; total: number }> {
    const where: Prisma.ClothingItemWhereInput = {
      userId: filters.userId,
      isActive: true,
      ...(filters.categoryId ? { categoryId: filters.categoryId } : {}),
      ...(filters.colorId ? { colorId: filters.colorId } : {}),
      ...(filters.occasionId
        ? { occasions: { some: { occasionId: filters.occasionId } } }
        : {}),
      ...(filters.tagId ? { tags: { some: { tagId: filters.tagId } } } : {}),
      ...(filters.search
        ? { name: { contains: filters.search, mode: 'insensitive' } }
        : {}),
    };

    const [rows, total] = await Promise.all([
      this.prisma.clothingItem.findMany({
        where,
        include: ITEM_INCLUDE,
        orderBy: { createdAt: 'desc' },
        skip: (filters.page - 1) * filters.limit,
        take: filters.limit,
      }),
      this.prisma.clothingItem.count({ where }),
    ]);

    return { items: rows.map((r) => this.toEntity(r)), total };
  }

  async update(
    id: string,
    userId: string,
    data: ClothingItemUpdate,
  ): Promise<ClothingItem> {
    const row = await this.prisma.clothingItem.update({
      where: { id },
      data: {
        ...(data.name !== undefined ? { name: data.name } : {}),
        ...(data.categoryId !== undefined ? { categoryId: data.categoryId } : {}),
        ...(data.colorId !== undefined ? { colorId: data.colorId } : {}),
        ...(data.description !== undefined ? { description: data.description } : {}),
        ...(data.imageUrls !== undefined ? { imageUrls: data.imageUrls } : {}),
        // Reemplazo total de las relaciones N:M cuando se envían.
        ...(data.occasionIds !== undefined
          ? {
              occasions: {
                deleteMany: {},
                create: data.occasionIds.map((occasionId) => ({ occasionId })),
              },
            }
          : {}),
        ...(data.tagIds !== undefined
          ? {
              tags: {
                deleteMany: {},
                create: data.tagIds.map((tagId) => ({ tagId })),
              },
            }
          : {}),
      },
      include: ITEM_INCLUDE,
    });
    // `update` filtra por id (PK). El use-case ya verificó pertenencia con findActiveById,
    // así que userId acá es defensivo/documental.
    void userId;
    return this.toEntity(row);
  }

  async archive(id: string, userId: string): Promise<void> {
    await this.prisma.clothingItem.updateMany({
      where: { id, userId, isActive: true },
      data: { isActive: false },
    });
  }

  async findExistingActiveIds(ids: string[], userId: string): Promise<string[]> {
    if (ids.length === 0) return [];
    const rows = await this.prisma.clothingItem.findMany({
      where: { id: { in: ids }, userId, isActive: true },
      select: { id: true },
    });
    return rows.map((r) => r.id);
  }

  private toEntity(row: ItemRow): ClothingItem {
    return new ClothingItem({
      id: row.id,
      userId: row.userId,
      name: row.name,
      categoryId: row.categoryId,
      colorId: row.colorId,
      description: row.description,
      imageUrls: row.imageUrls,
      isActive: row.isActive,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      category: new Category(row.category),
      color: new Color(row.color),
      occasions: row.occasions.map((o) => new Occasion(o.occasion)),
      tags: row.tags.map((t) => new Tag(t.tag)),
    });
  }
}
