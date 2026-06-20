import { NestFactory } from '@nestjs/core';
import { Logger } from 'nestjs-pino';

import { AppModule } from './app.module';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });

  // nestjs-pino como logger de toda la app (ver docs/CODING-CONVENTIONS.md §3).
  app.useLogger(app.get(Logger));

  // Base de la API: todas las rutas cuelgan de /api (ver docs/04-API-SPECIFICATION.md).
  app.setGlobalPrefix('api');

  // CORS abierto en el MVP; se restringirá cuando exista apps/mobile.
  app.enableCors();

  const port = process.env.PORT ? Number(process.env.PORT) : 3000;
  // 0.0.0.0 para ser alcanzable desde fuera del contenedor (Caddy proxya hacia aquí).
  await app.listen(port, '0.0.0.0');
}

void bootstrap();
