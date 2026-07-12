import { IsOptional, IsString, IsUrl, MaxLength, MinLength } from 'class-validator';

/** Body de `PUT /api/users/me`. Actualiza el perfil del usuario único. */
export class UpdateUserDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  name?: string;

  @IsOptional()
  @IsUrl()
  photoUrl?: string;
}
