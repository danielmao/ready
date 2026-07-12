import { Inject, Injectable } from '@nestjs/common';

import { User } from '../../domain/entities/user.entity';
import { UpdateUserDto } from '../dtos/update-user.dto';
import {
  USER_REPOSITORY,
  type UserRepository,
} from '../repositories/user.repository.interface';

/** Actualiza `name`/`photoUrl` del usuario actual. */
@Injectable()
export class UpdateMeUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly repository: UserRepository,
  ) {}

  execute(dto: UpdateUserDto, userId: string): Promise<User> {
    return this.repository.update(userId, {
      name: dto.name,
      photoUrl: dto.photoUrl,
    });
  }
}
