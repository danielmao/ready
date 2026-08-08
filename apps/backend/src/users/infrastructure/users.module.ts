import { Global, Module } from '@nestjs/common';

import { UsersFacade } from '../application/facades/users.facade';
import { USER_REPOSITORY } from '../application/repositories/user.repository.interface';
import { FindOrCreateByGoogleUseCase } from '../application/use-cases/find-or-create-by-google.use-case';
import { GetMeUseCase } from '../application/use-cases/get-me.use-case';
import { UpdateMeUseCase } from '../application/use-cases/update-me.use-case';
import { UsersController } from './controllers/users.controller';
import { PrismaUserRepository } from './persistence/repositories/prisma-user.repository';

/**
 * Wiring del dominio `users`: perfil del usuario y resolución de identidades de Google.
 *
 * `@Global` + `exports: [UsersFacade]`: misma convención que `clothes`. `auth` inyecta la
 * facade sin importar este módulo de infraestructura (eso violaría el boundary de dominios).
 */
@Global()
@Module({
  controllers: [UsersController],
  providers: [
    { provide: USER_REPOSITORY, useClass: PrismaUserRepository },
    GetMeUseCase,
    UpdateMeUseCase,
    FindOrCreateByGoogleUseCase,
    // Facade pública.
    UsersFacade,
  ],
  exports: [UsersFacade],
})
export class UsersModule {}
