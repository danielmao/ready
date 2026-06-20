import { Controller, Get } from '@nestjs/common';

/**
 * Liveness puro: prueba que el proceso corre y el host responde.
 * NO toca la base de datos (ver docs/specs/active/backend-first-deploy-health.md).
 * Un readiness con chequeo de dependencias es una iteración posterior.
 */
@Controller('health')
export class HealthController {
  @Get()
  check(): {
    status: 'ok';
    service: string;
    version: string;
    uptime: number;
  } {
    return {
      status: 'ok',
      service: 'ready-backend',
      version: process.env.npm_package_version ?? '0.0.1',
      uptime: Math.floor(process.uptime()),
    };
  }
}
