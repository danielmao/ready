import {
  Injectable,
  type OnModuleDestroy,
  type OnModuleInit,
} from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

/**
 * Cliente Prisma compartido. Es infra transversal (src/shared/prisma): el único punto de
 * acceso a la DB. Los repositorios Prisma de cada dominio (infrastructure/persistence) lo
 * inyectan; ninguna otra capa lo toca (regla `prisma-only-in-persistence`).
 */
@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  async onModuleInit(): Promise<void> {
    await this.$connect();
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
  }
}
