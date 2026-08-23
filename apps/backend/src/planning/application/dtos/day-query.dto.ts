import { IsOptional, Matches } from 'class-validator';

/**
 * Query de `GET /api/planning` y `DELETE /api/planning`: el día sobre el que se opera.
 * Opcional — sin él el servidor asume "hoy" (UTC), suficiente para curl/monitoreo; la app
 * manda siempre el día explícito.
 */
export class DayQueryDto {
  @IsOptional()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'day debe tener formato YYYY-MM-DD',
  })
  day?: string;
}
