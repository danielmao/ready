import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../../../shared/prisma/prisma.service';
import { Category } from '../../../domain/entities/category.entity';
import { Color } from '../../../domain/entities/color.entity';
import { Occasion } from '../../../domain/entities/occasion.entity';
import { Tag } from '../../../domain/entities/tag.entity';
import type { CatalogRepository } from '../../../application/repositories/catalog.repository.interface';

/** Implementación Prisma de los catálogos de `clothes`. Único lugar que mapea modelo ↔ entidad. */
@Injectable()
export class PrismaCatalogRepository implements CatalogRepository {
  constructor(private readonly prisma: PrismaService) {}

  // --- Categories ---
  async listCategories(): Promise<Category[]> {
    const rows = await this.prisma.category.findMany({ orderBy: { name: 'asc' } });
    return rows.map((r) => new Category(r));
  }

  async findCategoryById(id: string): Promise<Category | null> {
    const row = await this.prisma.category.findUnique({ where: { id } });
    return row ? new Category(row) : null;
  }

  // --- Colors ---
  async listColors(): Promise<Color[]> {
    const rows = await this.prisma.color.findMany({ orderBy: { name: 'asc' } });
    return rows.map((r) => new Color(r));
  }

  async findColorById(id: string): Promise<Color | null> {
    const row = await this.prisma.color.findUnique({ where: { id } });
    return row ? new Color(row) : null;
  }

  // --- Occasions (globales + del usuario) ---
  async listOccasions(userId: string): Promise<Occasion[]> {
    const rows = await this.prisma.occasion.findMany({
      where: { OR: [{ isGlobal: true }, { userId }] },
      orderBy: { name: 'asc' },
    });
    return rows.map((r) => new Occasion(r));
  }

  async findOccasionByName(
    name: string,
    userId: string,
  ): Promise<Occasion | null> {
    const row = await this.prisma.occasion.findFirst({
      where: { name, OR: [{ isGlobal: true }, { userId }] },
    });
    return row ? new Occasion(row) : null;
  }

  async createOccasion(name: string, userId: string): Promise<Occasion> {
    const row = await this.prisma.occasion.create({
      data: { name, userId, isGlobal: false },
    });
    return new Occasion(row);
  }

  async findExistingOccasionIds(
    ids: string[],
    userId: string,
  ): Promise<string[]> {
    if (ids.length === 0) return [];
    const rows = await this.prisma.occasion.findMany({
      where: { id: { in: ids }, OR: [{ isGlobal: true }, { userId }] },
      select: { id: true },
    });
    return rows.map((r) => r.id);
  }

  // --- Tags (del usuario) ---
  async listTags(userId: string, search?: string): Promise<Tag[]> {
    const rows = await this.prisma.tag.findMany({
      where: {
        userId,
        ...(search ? { name: { contains: search, mode: 'insensitive' } } : {}),
      },
      orderBy: { name: 'asc' },
    });
    return rows.map((r) => new Tag(r));
  }

  async findTagByName(name: string, userId: string): Promise<Tag | null> {
    const row = await this.prisma.tag.findFirst({ where: { name, userId } });
    return row ? new Tag(row) : null;
  }

  async createTag(name: string, userId: string): Promise<Tag> {
    const row = await this.prisma.tag.create({ data: { name, userId } });
    return new Tag(row);
  }

  async findExistingTagIds(ids: string[], userId: string): Promise<string[]> {
    if (ids.length === 0) return [];
    const rows = await this.prisma.tag.findMany({
      where: { id: { in: ids }, userId },
      select: { id: true },
    });
    return rows.map((r) => r.id);
  }
}
