import { Matches } from 'class-validator';

/** Body de `PUT /api/planning/confirm`: qué día del plan se confirma (HU-05). */
export class ConfirmPlannedOutfitDto {
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'day debe tener formato YYYY-MM-DD',
  })
  day!: string;
}
