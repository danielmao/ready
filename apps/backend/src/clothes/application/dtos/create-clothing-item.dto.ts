import {
  ArrayUnique,
  IsArray,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  MinLength,
} from 'class-validator';

/** Body de `POST /api/clothes`. name/categoryId/colorId obligatorios (docs/04). */
export class CreateClothingItemDto {
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  name!: string;

  @IsUUID()
  categoryId!: string;

  @IsUUID()
  colorId!: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

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

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  imageUrls?: string[];
}
