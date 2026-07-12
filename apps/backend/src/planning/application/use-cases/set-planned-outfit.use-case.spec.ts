import { NotFoundException } from '@nestjs/common';

import { SetPlannedOutfitUseCase } from './set-planned-outfit.use-case';

describe('SetPlannedOutfitUseCase', () => {
  const repository = { create: jest.fn() };
  const outfits = { findActiveOutfitById: jest.fn() };
  const useCase = new SetPlannedOutfitUseCase(
    repository as never,
    outfits as never,
  );

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('valida el outfit y persiste el planeado', async () => {
    outfits.findActiveOutfitById.mockResolvedValue({ id: 'o1', items: [] });
    repository.create.mockResolvedValue({ id: 'p1', outfitId: 'o1' });

    const result = await useCase.execute({ outfitId: 'o1' } as never, 'user1');

    expect(repository.create).toHaveBeenCalledWith({
      userId: 'user1',
      outfitId: 'o1',
      plannedFor: null,
    });
    expect(result.plannedOutfit).toEqual({ id: 'p1', outfitId: 'o1' });
  });

  it('rechaza con 404 cuando el outfit no existe o no es del usuario', async () => {
    outfits.findActiveOutfitById.mockResolvedValue(null);

    await expect(
      useCase.execute({ outfitId: 'missing' } as never, 'user1'),
    ).rejects.toBeInstanceOf(NotFoundException);
    expect(repository.create).not.toHaveBeenCalled();
  });
});
