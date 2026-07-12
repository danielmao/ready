import { IsISO8601, IsOptional, IsUUID, ValidateIf } from 'class-validator';

/**
 * Body de `POST /api/planning`. Fija un outfit como el próximo. `plannedFor` queda como punto
 * de extensión (calendario, Épica 2); en el MVP siempre viaja `null`/ausente.
 */
export class SetPlannedOutfitDto {
  @IsUUID()
  outfitId!: string;

  @IsOptional()
  @ValidateIf((_o, value) => value !== null)
  @IsISO8601()
  plannedFor?: string | null;
}
