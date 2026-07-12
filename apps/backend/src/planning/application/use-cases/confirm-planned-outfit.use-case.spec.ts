import { NotFoundException } from '@nestjs/common';

import { ConfirmPlannedOutfitUseCase } from './confirm-planned-outfit.use-case';

describe('ConfirmPlannedOutfitUseCase', () => {
  const repository = { findActive: jest.fn(), confirm: jest.fn() };
  const useCase = new ConfirmPlannedOutfitUseCase(repository as never);

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('confirma el planeado activo', async () => {
    repository.findActive.mockResolvedValue({ id: 'p1' });
    repository.confirm.mockResolvedValue({ id: 'p1', status: 'confirmed' });

    const result = await useCase.execute('user1');

    expect(repository.confirm).toHaveBeenCalledWith('p1');
    expect(result).toEqual({ id: 'p1', status: 'confirmed' });
  });

  it('rechaza con 404 cuando no hay planeado activo', async () => {
    repository.findActive.mockResolvedValue(null);

    await expect(useCase.execute('user1')).rejects.toBeInstanceOf(
      NotFoundException,
    );
    expect(repository.confirm).not.toHaveBeenCalled();
  });
});
