import { Injectable } from '@nestjs/common';
import type { PlannedOutfit as PlannedOutfitRow } from '@prisma/client';

import { PrismaService } from '../../../../shared/prisma/prisma.service';
import { PlannedOutfit } from '../../../domain/entities/planned-outfit.entity';
import type {
  NewPlannedOutfit,
  PlannedOutfitRepository,
} from '../../../application/repositories/planned-outfit.repository.interface';

/**
 * Implementación Prisma del contrato `PlannedOutfitRepository`. Único lugar autorizado a tocar
 * `@prisma/client` para este agregado; mapea modelo Prisma ↔ entidad de dominio.
 *
 * "Activo" = status ≠ cancelled. El invariante de **un solo activo por (usuario, día)** se
 * sostiene cancelando el del mismo día dentro de la transacción de `create`: por eso el filtro
 * de cancelación lleva `plannedFor`, y no barre la semana entera.
 */
@Injectable()
export class PrismaPlannedOutfitRepository implements PlannedOutfitRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findActiveByDay(userId: string, day: Date): Promise<PlannedOutfit | null> {
    const row = await this.prisma.plannedOutfit.findFirst({
      where: { userId, plannedFor: day, status: { not: 'cancelled' } },
      orderBy: { createdAt: 'desc' },
    });
    return row ? this.toEntity(row) : null;
  }

  async findActiveBetween(
    userId: string,
    from: Date,
    to: Date,
  ): Promise<PlannedOutfit[]> {
    const rows = await this.prisma.plannedOutfit.findMany({
      where: {
        userId,
        status: { not: 'cancelled' },
        plannedFor: { gte: from, lte: to },
      },
      // Ascendente: si un día quedara con dos activos (no debería), gana el más reciente al
      // volcarse al mapa por día en PlanHydrationService.
      orderBy: { createdAt: 'asc' },
    });
    return rows.map((row) => this.toEntity(row));
  }

  async create(data: NewPlannedOutfit): Promise<PlannedOutfit> {
    const row = await this.prisma.$transaction(async (tx) => {
      // Cancela lo que hubiera planeado ESE día (planned/confirmed) antes de fijar el nuevo.
      await tx.plannedOutfit.updateMany({
        where: {
          userId: data.userId,
          plannedFor: data.plannedFor,
          status: { not: 'cancelled' },
        },
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

  async confirm(id: string): Promise<PlannedOutfit> {
    const row = await this.prisma.plannedOutfit.update({
      where: { id },
      data: { status: 'confirmed' },
    });
    return this.toEntity(row);
  }

  async cancelDay(userId: string, day: Date): Promise<void> {
    await this.prisma.plannedOutfit.updateMany({
      where: { userId, plannedFor: day, status: { not: 'cancelled' } },
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
