import { Inject, Injectable, NotFoundException } from '@nestjs/common';

import { User } from '../../domain/entities/user.entity';
import {
  USER_REPOSITORY,
  type UserRepository,
} from '../repositories/user.repository.interface';

/** Devuelve el perfil del usuario actual (MVP: el usuario único sembrado). */
@Injectable()
export class GetMeUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly repository: UserRepository,
  ) {}

  async execute(userId: string): Promise<User> {
    const user = await this.repository.findById(userId);
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }
    return user;
  }
}
