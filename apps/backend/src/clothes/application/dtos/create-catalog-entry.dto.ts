import { IsString, MaxLength, MinLength } from 'class-validator';

/** Body de `POST /api/clothes/tags` y `POST /api/clothes/occasions`: sólo `{ name }`. */
export class CreateCatalogEntryDto {
  @IsString()
  @MinLength(1)
  @MaxLength(60)
  name!: string;
}
