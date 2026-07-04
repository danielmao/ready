import { BadRequestException, NotFoundException } from '@nestjs/common';

import { UpdateClothingItemUseCase } from './update-clothing-item.use-case';

describe('UpdateClothingItemUseCase', () => {
  const repository = { findActiveById: jest.fn(), update: jest.fn() };
  const catalogValidation = {
    assertCategoryExists: jest.fn(),
    assertColorExists: jest.fn(),
    assertOccasionsExist: jest.fn(),
    assertTagsExist: jest.fn(),
  };
  const useCase = new UpdateClothingItemUseCase(
    repository as never,
    catalogValidation as never,
  );

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('valida solo los catálogos presentes y persiste los cambios', async () => {
    repository.findActiveById.mockResolvedValue({ id: 'c1' });
    const updated = { id: 'c1', name: 'Remera nueva' };
    repository.update.mockResolvedValue(updated);

    const result = await useCase.execute(
      'c1',
      { name: 'Remera nueva', colorId: 'col2' } as never,
      'user1',
    );

    expect(catalogValidation.assertColorExists).toHaveBeenCalledWith('col2');
    expect(catalogValidation.assertCategoryExists).not.toHaveBeenCalled();
    expect(result).toBe(updated);
  });

  it('lanza NotFound cuando la prenda no existe o no es del usuario', async () => {
    repository.findActiveById.mockResolvedValue(null);

    await expect(
      useCase.execute('missing', { name: 'X' } as never, 'user1'),
    ).rejects.toBeInstanceOf(NotFoundException);
    expect(repository.update).not.toHaveBeenCalled();
  });

  it('propaga el error y no persiste cuando un catálogo no existe', async () => {
    repository.findActiveById.mockResolvedValue({ id: 'c1' });
    catalogValidation.assertCategoryExists.mockRejectedValue(
      new BadRequestException(),
    );

    await expect(
      useCase.execute('c1', { categoryId: 'bad' } as never, 'user1'),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(repository.update).not.toHaveBeenCalled();
  });
});
