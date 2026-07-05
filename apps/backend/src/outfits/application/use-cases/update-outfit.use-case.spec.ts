import { NotFoundException } from '@nestjs/common';

import { UpdateOutfitUseCase } from './update-outfit.use-case';

describe('UpdateOutfitUseCase', () => {
  const repository = {
    findActiveById: jest.fn(),
    update: jest.fn(),
  };
  const validation = {
    assertItemsValid: jest.fn(),
    assertOccasionsExist: jest.fn(),
    assertTagsExist: jest.fn(),
  };
  const useCase = new UpdateOutfitUseCase(
    repository as never,
    validation as never,
  );

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('404 si el outfit no existe o está archivado', async () => {
    repository.findActiveById.mockResolvedValue(null);

    await expect(
      useCase.execute('o1', { name: 'x' } as never, 'user1'),
    ).rejects.toBeInstanceOf(NotFoundException);
    expect(repository.update).not.toHaveBeenCalled();
  });

  it('revalida el set de prendas cuando se reemplaza', async () => {
    repository.findActiveById.mockResolvedValue({ id: 'o1' });
    repository.update.mockResolvedValue({ id: 'o1' });
    const items = [
      { clothingItemId: 'a', order: 1 },
      { clothingItemId: 'b', order: 2 },
    ];

    await useCase.execute('o1', { outfitItems: items } as never, 'user1');

    expect(validation.assertItemsValid).toHaveBeenCalledWith(items, 'user1');
    expect(repository.update).toHaveBeenCalled();
  });
});
