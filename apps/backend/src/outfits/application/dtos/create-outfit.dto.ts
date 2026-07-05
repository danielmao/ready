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

/** Body de `POST /api/outfits`. name + mínimo 2 prendas (docs/04). */
export class CreateOutfitDto {
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  name!: string;

  @IsArray()
  @ArrayMinSize(2)
  @ValidateNested({ each: true })
  @Type(() => OutfitItemDto)
  outfitItems!: OutfitItemDto[];

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
