import { BadRequestException } from '@nestjs/common';

import { verifyShortLived } from '../../../shared/auth/jwt';
import {
  StartGoogleLoginUseCase,
  type LoginState,
} from './start-google-login.use-case';

describe('StartGoogleLoginUseCase', () => {
  const provider = { buildAuthorizationUrl: jest.fn() };
  const useCase = new StartGoogleLoginUseCase(provider as never);

  beforeAll(() => {
    process.env.JWT_SECRET = 'test-secret';
    process.env.AUTH_ALLOWED_REDIRECTS = 'ready://auth';
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('rechaza un redirect_uri fuera de la lista blanca', () => {
    expect(() => useCase.execute('https://evil.example/steal')).toThrow(
      BadRequestException,
    );
  });

  it('firma el destino y el verifier PKCE dentro del state', () => {
    provider.buildAuthorizationUrl.mockReturnValue(
      'https://accounts.google.com/o/oauth2',
    );

    const url = useCase.execute('ready://auth');

    const { state } = provider.buildAuthorizationUrl.mock.calls[0][0];
    expect(verifyShortLived<LoginState>(state)?.redirectUri).toBe(
      'ready://auth',
    );
    expect(url).toBe('https://accounts.google.com/o/oauth2');
  });
});
