import { Injectable } from '@nestjs/common';
import type { PlannedOutfit as PlannedOutfitRow } from '@prisma/client';

import { PrismaService } from '../../../../shared/prisma/prisma.service';
import { PlannedOutfit } from '../../../domain/entities/planned-outfit.entity';
import type {
  NewPlannedOutfit,
  PlannedOutfitRepository,
  PlannedOutfitUpdate,
} from '../../../application/repositories/planned-outfit.repository.interface';

/**
 * Implementación Prisma del contrato `PlannedOutfitRepository`. Único lugar autorizado a tocar
 * `@prisma/client` para este agregado; mapea modelo Prisma ↔ entidad de dominio. "Activo" =
 * status ≠ cancelled; el invariante de un solo activo se sostiene cancelando el anterior dentro
 * de la misma transacción al crear.
 */
@Injectable()
export class PrismaPlannedOutfitRepository implements PlannedOutfitRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findActive(userId: string): Promise<PlannedOutfit | null> {
    const row = await this.prisma.plannedOutfit.findFirst({
      where: { userId, status: { not: 'cancelled' } },
      orderBy: { createdAt: 'desc' },
    });
    return row ? this.toEntity(row) : null;
  }

  async create(data: NewPlannedOutfit): Promise<PlannedOutfit> {
    const row = await this.prisma.$transaction(async (tx) => {
      // Cancela el activo anterior (planned/confirmed) antes de fijar el nuevo.
      await tx.plannedOutfit.updateMany({
        where: { userId: data.userId, status: { not: 'cancelled' } },
        data: { status: 'cancelled' },
      });
      return tx.plannedOutfit.create({
        data: {
          userId: data.userId,
          outfitId: data.outfitId,
          plannedFor: data.plannedFor,
          status: 'planned',
        },
      });
    });
    return this.toEntity(row);
  }

  async update(id: string, data: PlannedOutfitUpdate): Promise<PlannedOutfit> {
    const row = await this.prisma.plannedOutfit.update({
      where: { id },
      data: {
        ...(data.outfitId !== undefined ? { outfitId: data.outfitId } : {}),
        ...(data.plannedFor !== undefined
          ? { plannedFor: data.plannedFor }
          : {}),
      },
    });
    return this.toEntity(row);
  }

  async confirm(id: string): Promise<PlannedOutfit> {
    const row = await this.prisma.plannedOutfit.update({
      where: { id },
      data: { status: 'confirmed' },
    });
    return this.toEntity(row);
  }

  async cancelActive(userId: string): Promise<void> {
    await this.prisma.plannedOutfit.updateMany({
      where: { userId, status: { not: 'cancelled' } },
      data: { status: 'cancelled' },
    });
  }

  private toEntity(row: PlannedOutfitRow): PlannedOutfit {
    return new PlannedOutfit({
      id: row.id,
      userId: row.userId,
      outfitId: row.outfitId,
      plannedFor: row.plannedFor,
      status: row.status,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    });
  }
}
