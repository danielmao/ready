import { NotFoundException } from '@nestjs/common';

import { GetMeUseCase } from './get-me.use-case';

describe('GetMeUseCase', () => {
  const repository = { findById: jest.fn() };
  const useCase = new GetMeUseCase(repository as never);

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('devuelve el perfil del usuario', async () => {
    const user = { id: 'user1', name: 'Ready' };
    repository.findById.mockResolvedValue(user);

    await expect(useCase.execute('user1')).resolves.toBe(user);
  });

  it('lanza 404 cuando el usuario no existe', async () => {
    repository.findById.mockResolvedValue(null);

    await expect(useCase.execute('ghost')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });
});
