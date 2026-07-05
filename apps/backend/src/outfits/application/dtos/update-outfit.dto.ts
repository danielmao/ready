import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  ArrayUnique,
  IsArray,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  MinLength,
  ValidateNested,
} from 'class-validator';

import { OutfitItemDto } from './outfit-item.dto';

/**
 * Body de `PUT /api/outfits/:id`. Todos los campos opcionales (update parcial). Si se envía
 * `outfitItems`, reemplaza el set entero y debe seguir teniendo ≥2 prendas.
 */
export class UpdateOutfitDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  name?: string;

  @IsOptional()
  @IsArray()
  @ArrayMinSize(2)
  @ValidateNested({ each: true })
  @Type(() => OutfitItemDto)
  outfitItems?: OutfitItemDto[];

  @IsOptional()
  @IsArray()
  @IsUUID('all', { each: true })
  @ArrayUnique()
  occasionIds?: string[];

  @IsOptional()
  @IsArray()
  @IsUUID('all', { each: true })
  @ArrayUnique()
  tagIds?: string[];
}
