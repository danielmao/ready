import { IsUUID, Matches } from 'class-validator';

/**
 * Body de `POST /api/planning`. Planea un outfit para un día concreto de la semana. Volver a
 * postear el mismo día lo reemplaza (cancela el anterior de ESE día, ver el repositorio).
 */
export class SetPlannedOutfitDto {
  @IsUUID()
  outfitId!: string;

  /**
   * Día a planear, `YYYY-MM-DD`. Lo manda **siempre** el cliente y lo calcula con su fecha
   * local: el servidor no puede adivinar el huso del usuario sin equivocarse en los bordes
   * del día.
   */
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'day debe tener formato YYYY-MM-DD',
  })
  day!: string;
}
