import { NotFoundException } from '@nestjs/common';

import { RemovePlannedOutfitUseCase } from './remove-planned-outfit.use-case';

describe('RemovePlannedOutfitUseCase', () => {
  const repository = { findActive: jest.fn(), cancelActive: jest.fn() };
  const useCase = new RemovePlannedOutfitUseCase(repository as never);

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('cancela el planeado activo', async () => {
    repository.findActive.mockResolvedValue({ id: 'p1' });

    const result = await useCase.execute('user1');

    expect(repository.cancelActive).toHaveBeenCalledWith('user1');
    expect(result).toEqual({ success: true });
  });

  it('rechaza con 404 cuando no hay planeado activo', async () => {
    repository.findActive.mockResolvedValue(null);

    await expect(useCase.execute('user1')).rejects.toBeInstanceOf(
      NotFoundException,
    );
    expect(repository.cancelActive).not.toHaveBeenCalled();
  });
});
