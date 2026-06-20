import { Module } from '@nestjs/common';
import { LoggerModule } from 'nestjs-pino';

import { HealthModule } from './shared/health/health.module';

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
    HealthModule,
  ],
})
export class AppModule {}
