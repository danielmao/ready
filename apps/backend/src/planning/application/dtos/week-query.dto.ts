import { IsOptional, Matches } from 'class-validator';

/**
 * Query de `GET /api/planning/week`. `start` es cualquier día de la semana buscada (el backend
 * lo normaliza al lunes). Ausente = la semana de hoy.
 */
export class WeekQueryDto {
  @IsOptional()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'start debe tener formato YYYY-MM-DD',
  })
  start?: string;
}
