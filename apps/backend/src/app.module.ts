import { Module } from '@nestjs/common';
import { LoggerModule } from 'nestjs-pino';

import { ClothesModule } from './clothes/infrastructure/clothes.module';
import { OutfitsModule } from './outfits/infrastructure/outfits.module';
import { PlanningModule } from './planning/infrastructure/planning.module';
import { HealthModule } from './shared/health/health.module';
import { PrismaModule } from './shared/prisma/prisma.module';
import { UsersModule } from './users/infrastructure/users.module';

@Module({
  imports: [
    LoggerModule.forRoot({
      pinoHttp: {
        // pino-pretty solo fuera de producción; en prod, JSON crudo a stdout.
        transport:
          process.env.NODE_ENV !== 'production'
            ? { target: 'pino-pretty', options: { singleLine: true } }
            : undefined,
      },
    }),
    PrismaModule,
    HealthModule,
    ClothesModule,
    OutfitsModule,
    PlanningModule,
    UsersModule,
  ],
})
export class AppModule {}
