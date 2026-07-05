import { BadRequestException } from '@nestjs/common';

import { CreateOutfitUseCase } from './create-outfit.use-case';

describe('CreateOutfitUseCase', () => {
  const repository = { create: jest.fn() };
  const validation = {
    assertItemsValid: jest.fn(),
    assertOccasionsExist: jest.fn(),
    assertTagsExist: jest.fn(),
  };
  const useCase = new CreateOutfitUseCase(
    repository as never,
    validation as never,
  );

  const outfitItems = [
    { clothingItemId: 'a', order: 1 },
    { clothingItemId: 'b', order: 2 },
  ];
  const dto = { name: 'Look oficina', outfitItems };

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('valida la composición y persiste el outfit', async () => {
    const created = { id: 'o1' };
    repository.create.mockResolvedValue(created);

    const result = await useCase.execute(dto as never, 'user1');

    expect(validation.assertItemsValid).toHaveBeenCalledWith(
      outfitItems,
      'user1',
    );
    expect(result).toBe(created);
  });

  it('propaga el error cuando la composición es inválida', async () => {
    validation.assertItemsValid.mockRejectedValue(new BadRequestException());

    await expect(useCase.execute(dto as never, 'user1')).rejects.toBeInstanceOf(
      BadRequestException,
    );
    expect(repository.create).not.toHaveBeenCalled();
  });
});
