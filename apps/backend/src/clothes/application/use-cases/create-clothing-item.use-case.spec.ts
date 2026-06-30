import { BadRequestException } from '@nestjs/common';

import { CreateClothingItemUseCase } from './create-clothing-item.use-case';

describe('CreateClothingItemUseCase', () => {
  const repository = { create: jest.fn() };
  const catalogValidation = {
    assertCategoryExists: jest.fn(),
    assertColorExists: jest.fn(),
    assertOccasionsExist: jest.fn(),
    assertTagsExist: jest.fn(),
  };
  const useCase = new CreateClothingItemUseCase(
    repository as never,
    catalogValidation as never,
  );

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('valida los catálogos y persiste la prenda', async () => {
    const created = { id: 'c1' };
    repository.create.mockResolvedValue(created);

    const result = await useCase.execute(
      { name: 'Remera', categoryId: 'cat1', colorId: 'col1' } as never,
      'user1',
    );

    expect(catalogValidation.assertCategoryExists).toHaveBeenCalledWith('cat1');
    expect(result).toBe(created);
  });

  it('propaga el error cuando una referencia de catálogo no existe', async () => {
    catalogValidation.assertColorExists.mockRejectedValue(
      new BadRequestException(),
    );

    await expect(
      useCase.execute(
        { name: 'X', categoryId: 'cat1', colorId: 'bad' } as never,
        'user1',
      ),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(repository.create).not.toHaveBeenCalled();
  });
});
