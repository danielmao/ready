// Carga .env → process.env en ejecución local (dev). En docker/prod el env viene del
// compose y dotenv no lo pisa (no override), así que es inerte allí.
import 'dotenv/config';

import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { Logger } from 'nestjs-pino';

import { AppModule } from './app.module';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });

  // nestjs-pino como logger de toda la app (ver docs/CODING-CONVENTIONS.md §3).
  app.useLogger(app.get(Logger));

  // Validación global de DTOs (class-validator). whitelist: descarta props no declaradas;
  // transform: convierte query strings a los tipos del DTO (p. ej. page/limit a number).
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // Base de la API: todas las rutas cuelgan de /api (ver docs/04-API-SPECIFICATION.md).
  app.setGlobalPrefix('api');

  // CORS abierto en el MVP; se restringirá cuando exista apps/mobile.
  app.enableCors();

  const port = process.env.PORT ? Number(process.env.PORT) : 3000;
  // 0.0.0.0 para ser alcanzable desde fuera del contenedor (Caddy proxya hacia aquí).
  await app.listen(port, '0.0.0.0');
}

void bootstrap();
