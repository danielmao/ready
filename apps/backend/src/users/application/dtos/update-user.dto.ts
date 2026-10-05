import { Transform } from 'class-transformer';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
} from 'class-validator';

/** Body de `PUT /api/users/me`. Actualiza el perfil del usuario único. */
export class UpdateUserDto {
  /** Se guarda recortado; vacío o solo espacios → 400. */
  @IsOptional()
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsString()
  @IsNotEmpty({ message: 'El nombre no puede estar vacío' })
  @MaxLength(120)
  name?: string;

  @IsOptional()
  @IsUrl()
  photoUrl?: string;
}
