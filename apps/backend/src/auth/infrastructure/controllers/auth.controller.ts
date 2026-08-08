import { Controller, Get, Query, Res } from '@nestjs/common';
import type { Response } from 'express';

import { CompleteGoogleLoginUseCase } from '../../application/use-cases/complete-google-login.use-case';
import { StartGoogleLoginUseCase } from '../../application/use-cases/start-google-login.use-case';

/**
 * Adaptador HTTP del dominio `auth`. Los dos endpoints son **navegables**: no los consume
 * `fetch`, los abre el navegador que la app levanta con `openAuthSessionAsync`. Por eso
 * responden 302 en vez de JSON.
 *
 * Flujo completo:
 *   app → GET /api/auth/google?redirect_uri=<deep link>  → 302 a Google
 *   Google → GET /api/auth/google/callback?code&state    → 302 al deep link con ?token=
 *   la app captura el deep link, guarda el token y cierra el navegador.
 *
 * Sin guard: por definición, quien entra acá todavía no tiene sesión.
 */
@Controller('auth')
export class AuthController {
  constructor(
    private readonly startGoogleLogin: StartGoogleLoginUseCase,
    private readonly completeGoogleLogin: CompleteGoogleLoginUseCase,
  ) {}

  @Get('google')
  start(
    @Query('redirect_uri') redirectUri: string,
    @Res() res: Response,
  ): void {
    res.redirect(this.startGoogleLogin.execute(redirectUri));
  }

  @Get('google/callback')
  async callback(
    @Query('code') code: string | undefined,
    @Query('state') state: string | undefined,
    @Query('error') error: string | undefined,
    @Res() res: Response,
  ): Promise<void> {
    res.redirect(
      await this.completeGoogleLogin.execute({ code, state, error }),
    );
  }
}
