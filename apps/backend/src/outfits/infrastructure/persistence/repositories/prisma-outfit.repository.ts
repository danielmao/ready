import { Injectable } from '@nestjs/common';
import type { Prisma } from '@prisma/client';

import { PrismaService } from '../../../../shared/prisma/prisma.service';
import { Outfit } from '../../../domain/entities/outfit.entity';
import { OutfitItem } from '../../../domain/entities/outfit-item.entity';
import type {
  NewOutfit,
  OutfitFilters,
  OutfitRepository,
  OutfitUpdate,
} from '../../../application/repositories/outfit.repository.interface';

/** Include estándar para hidratar un outfit con sus ítems (+ prenda) y etiquetas. */
const OUTFIT_INCLUDE = {
  items: {
    orderBy: { order: 'asc' },
    include: {
      clothingItem: { include: { category: true, color: true } },
    },
  },
  occasions: { include: { occasion: true } },
  tags: { include: { tag: true } },
} satisfies Prisma.OutfitInclude;

type OutfitRow = Prisma.OutfitGetPayload<{ include: typeof OUTFIT_INCLUDE }>;

/**
 * Implementación Prisma del contrato `OutfitRepository`. Único lugar autorizado a tocar
 * `@prisma/client` para este agregado; mapea modelo Prisma ↔ entidad de dominio. Lee la tabla
 * `clothing_items` sólo por el join (DB compartida); nunca importa el dominio `clothes`.
 */
@Injectable()
export class PrismaOutfitRepository implements OutfitRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: NewOutfit): Promise<Outfit> {
    const row = await this.prisma.outfit.create({
      data: {
        userId: data.userId,
        name: data.name,
        items: { create: data.items.map((i) => ({ clothingItemId: i.clothingItemId, order: i.order })) },
        occasions: { create: data.occasionIds.map((occasionId) => ({ occasionId })) },
        tags: { create: data.tagIds.map((tagId) => ({ tagId })) },
      },
      include: OUTFIT_INCLUDE,
    });
    return this.toEntity(row);
  }

  async findActiveById(id: string, userId: string): Promise<Outfit | null> {
    const row = await this.prisma.outfit.findFirst({
      where: { id, userId, isActive: true },
      include: OUTFIT_INCLUDE,
    });
    return row ? this.toEntity(row) : null;
  }

  async findMany(
    filters: OutfitFilters,
  ): Promise<{ items: Outfit[]; total: number }> {
    const where: Prisma.OutfitWhereInput = {
      userId: filters.userId,
      isActive: true,
      ...(filters.occasionId
        ? { occasions: { some: { occasionId: filters.occasionId } } }
        : {}),
      ...(filters.tagId ? { tags: { some: { tagId: filters.tagId } } } : {}),
      ...(filters.clothingId
        ? { items: { some: { clothingItemId: filters.clothingId } } }
        : {}),
      ...(filters.search
        ? { name: { contains: filters.search, mode: 'insensitive' } }
        : {}),
    };

    const [rows, total] = await Promise.all([
      this.prisma.outfit.findMany({
        where,
        include: OUTFIT_INCLUDE,
        orderBy: { createdAt: 'desc' },
        skip: (filters.page - 1) * filters.limit,
        take: filters.limit,
      }),
      this.prisma.outfit.count({ where }),
    ]);

    return { items: rows.map((r) => this.toEntity(r)), total };
  }

  async update(
    id: string,
    userId: string,
    data: OutfitUpdate,
  ): Promise<Outfit> {
    // Reemplazo total de relaciones cuando se envían; transacción para no dejar sets a medias.
    const row = await this.prisma.$transaction(async (tx) => {
      if (data.items !== undefined) {
        await tx.outfitItem.deleteMany({ where: { outfitId: id } });
      }
      if (data.occasionIds !== undefined) {
        await tx.outfitOccasion.deleteMany({ where: { outfitId: id } });
      }
      if (data.tagIds !== undefined) {
        await tx.outfitTag.deleteMany({ where: { outfitId: id } });
      }
      return tx.outfit.update({
        where: { id },
        data: {
          ...(data.name !== undefined ? { name: data.name } : {}),
          ...(data.items !== undefined
            ? {
                items: {
                  create: data.items.map((i) => ({
                    clothingItemId: i.clothingItemId,
                    order: i.order,
                  })),
                },
              }
            : {}),
          ...(data.occasionIds !== undefined
            ? {
                occasions: {
                  create: data.occasionIds.map((occasionId) => ({ occasionId })),
                },
              }
            : {}),
          ...(data.tagIds !== undefined
            ? { tags: { create: data.tagIds.map((tagId) => ({ tagId })) } }
            : {}),
        },
        include: OUTFIT_INCLUDE,
      });
    });
    // `update` filtra por id (PK). El use-case ya verificó pertenencia con findActiveById,
    // así que userId acá es defensivo/documental.
    void userId;
    return this.toEntity(row);
  }

  async archive(id: string, userId: string): Promise<void> {
    await this.prisma.outfit.updateMany({
      where: { id, userId, isActive: true },
      data: { isActive: false },
    });
  }

  private toEntity(row: OutfitRow): Outfit {
    return new Outfit({
      id: row.id,
      userId: row.userId,
      name: row.name,
      isActive: row.isActive,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      items: row.items.map(
        (it) =>
          new OutfitItem({
            id: it.id,
            clothingItemId: it.clothingItemId,
            order: it.order,
            clothingItem: {
              id: it.clothingItem.id,
              name: it.clothingItem.name,
              imageUrls: it.clothingItem.imageUrls,
              category: it.clothingItem.category
                ? {
                    id: it.clothingItem.category.id,
                    name: it.clothingItem.category.name,
                  }
                : null,
              color: it.clothingItem.color
                ? {
                    id: it.clothingItem.color.id,
                    name: it.clothingItem.color.name,
                    hexCode: it.clothingItem.color.hexCode,
                  }
                : null,
            },
          }),
      ),
      occasions: row.occasions.map((o) => ({
        id: o.occasion.id,
        name: o.occasion.name,
      })),
      tags: row.tags.map((t) => ({ id: t.tag.id, name: t.tag.name })),
    });
  }
}
