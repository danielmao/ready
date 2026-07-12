import { Injectable } from '@nestjs/common';
import type { User as UserRow } from '@prisma/client';

import { PrismaService } from '../../../../shared/prisma/prisma.service';
import { User } from '../../../domain/entities/user.entity';
import type {
  UserRepository,
  UserUpdate,
} from '../../../application/repositories/user.repository.interface';

/** Implementación Prisma del contrato `UserRepository`. Mapea modelo Prisma ↔ entidad. */
@Injectable()
export class PrismaUserRepository implements UserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<User | null> {
    const row = await this.prisma.user.findUnique({ where: { id } });
    return row ? this.toEntity(row) : null;
  }

  async update(id: string, data: UserUpdate): Promise<User> {
    const row = await this.prisma.user.update({
      where: { id },
      data: {
        ...(data.name !== undefined ? { name: data.name } : {}),
        ...(data.photoUrl !== undefined ? { photoUrl: data.photoUrl } : {}),
      },
    });
    return this.toEntity(row);
  }

  private toEntity(row: UserRow): User {
    return new User({
      id: row.id,
      email: row.email,
      name: row.name,
      photoUrl: row.photoUrl,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    });
  }
}
