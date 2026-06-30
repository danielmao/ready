import { Global, Module } from '@nestjs/common';

import { PrismaService } from './prisma.service';

/**
 * @Global: PrismaService queda disponible para inyección en cualquier dominio sin re-importar
 * el módulo. Sólo lo consumen los repositorios Prisma de infrastructure/persistence.
 */
@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
