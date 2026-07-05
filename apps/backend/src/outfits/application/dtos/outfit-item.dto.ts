import { IsInt, IsUUID, Min } from 'class-validator';

/** Una prenda dentro del body de crear/editar outfit: qué prenda y en qué posición. */
export class OutfitItemDto {
  @IsUUID()
  clothingItemId!: string;

  @IsInt()
  @Min(1)
  order!: number;
}
