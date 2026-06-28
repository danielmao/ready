import {
  ArrayUnique,
  IsArray,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  MinLength,
} from 'class-validator';

/** Body de `PUT /api/clothes/:id`. Todos los campos opcionales (update parcial). */
export class UpdateClothingItemDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  name?: string;

  @IsOptional()
  @IsUUID()
  categoryId?: string;

  @IsOptional()
  @IsUUID()
  colorId?: string;

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
