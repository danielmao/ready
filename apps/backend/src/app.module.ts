import { Module } from '@nestjs/common';
import { LoggerModule } from 'nestjs-pino';

import { ClothesModule } from './clothes/infrastructure/clothes.module';
import { OutfitsModule } from './outfits/infrastructure/outfits.module';
import { HealthModule } from './shared/health/health.module';
import { PrismaModule } from './shared/prisma/prisma.module';

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
  ],
})
export class AppModule {}
