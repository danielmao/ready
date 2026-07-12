import { IsISO8601, IsOptional, IsUUID, ValidateIf } from 'class-validator';

/**
 * Body de `PUT /api/planning`. Actualiza el planeado activo. Todos los campos opcionales:
 * cambiar el outfit fijado y/o su `plannedFor` (roadmap).
 */
export class UpdatePlannedOutfitDto {
  @IsOptional()
  @IsUUID()
  outfitId?: string;

  @IsOptional()
  @ValidateIf((_o, value) => value !== null)
  @IsISO8601()
  plannedFor?: string | null;
}
