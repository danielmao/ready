import { BadRequestException } from '@nestjs/common';

import { signShortLived, verifyAccessToken } from '../../../shared/auth/jwt';
import { CompleteGoogleLoginUseCase } from './complete-google-login.use-case';

describe('CompleteGoogleLoginUseCase', () => {
  const provider = { exchangeCode: jest.fn() };
  const users = { resolveFromGoogle: jest.fn() };
  const useCase = new CompleteGoogleLoginUseCase(
    provider as never,
    users as never,
  );

  beforeAll(() => {
    process.env.JWT_SECRET = 'test-secret';
  });

  /** State válido, como el que emitió el arranque del login. */
  const validState = () =>
    signShortLived({ redirectUri: 'ready://auth', codeVerifier: 'v1' }, 600);

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('corta si el state no es nuestro: sin él no hay destino confiable', async () => {
    await expect(
      useCase.execute({ code: 'c1', state: 'manipulado' }),
    ).rejects.toThrow(BadRequestException);
  });

  it('devuelve al usuario a la app con el access token', async () => {
    provider.exchangeCode.mockResolvedValue({ googleId: 'g1' });
    users.resolveFromGoogle.mockResolvedValue({ id: 'user1' });

    const url = await useCase.execute({ code: 'c1', state: validState() });

    const token = new URL(url).searchParams.get('token');
    expect(verifyAccessToken(token as string)).toBe('user1');
  });

  it('vuelve a la app con ?error cuando el usuario cancela en Google', async () => {
    const url = await useCase.execute({
      error: 'access_denied',
      state: validState(),
    });

    expect(url).toBe('ready://auth?error=access_denied');
    expect(provider.exchangeCode).not.toHaveBeenCalled();
  });
});
