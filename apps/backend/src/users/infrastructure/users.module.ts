import { Module } from '@nestjs/common';

import { USER_REPOSITORY } from '../application/repositories/user.repository.interface';
import { GetMeUseCase } from '../application/use-cases/get-me.use-case';
import { UpdateMeUseCase } from '../application/use-cases/update-me.use-case';
import { UsersController } from './controllers/users.controller';
import { PrismaUserRepository } from './persistence/repositories/prisma-user.repository';

/**
 * Wiring del dominio `users` (mínimo MVP): perfil del usuario único. Dominio terminal, sin
 * facade (nadie lo consume). El día que entre auth real, este dominio crece con el login.
 */
@Module({
  controllers: [UsersController],
  providers: [
    { provide: USER_REPOSITORY, useClass: PrismaUserRepository },
    GetMeUseCase,
    UpdateMeUseCase,
  ],
})
export class UsersModule {}
