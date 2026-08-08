import { Module } from '@nestjs/common';

import { IDENTITY_PROVIDER } from '../application/ports/identity-provider.interface';
import { CompleteGoogleLoginUseCase } from '../application/use-cases/complete-google-login.use-case';
import { StartGoogleLoginUseCase } from '../application/use-cases/start-google-login.use-case';
import { AuthController } from './controllers/auth.controller';
import { GoogleIdentityProvider } from './providers/google-identity.provider';

/**
 * Wiring del dominio `auth`. Dominio **terminal**: nadie lo consume, así que no expone
 * facade. Consume `UsersFacade` (global) para traducir la identidad de Google a un usuario.
 */
@Module({
  controllers: [AuthController],
  providers: [
    // Binding puerto → adapter Google.
    { provide: IDENTITY_PROVIDER, useClass: GoogleIdentityProvider },
    StartGoogleLoginUseCase,
    CompleteGoogleLoginUseCase,
  ],
})
export class AuthModule {}
