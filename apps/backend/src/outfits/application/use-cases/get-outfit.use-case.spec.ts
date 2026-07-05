import { NotFoundException } from '@nestjs/common';

import { GetOutfitUseCase } from './get-outfit.use-case';

describe('GetOutfitUseCase', () => {
  const repository = { findActiveById: jest.fn() };
  const useCase = new GetOutfitUseCase(repository as never);

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('devuelve el outfit activo del usuario', async () => {
    const outfit = { id: 'o1' };
    repository.findActiveById.mockResolvedValue(outfit);

    await expect(useCase.execute('o1', 'user1')).resolves.toBe(outfit);
  });

  it('404 si no existe / está archivado / es de otro usuario', async () => {
    repository.findActiveById.mockResolvedValue(null);

    await expect(useCase.execute('o1', 'user1')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });
});
