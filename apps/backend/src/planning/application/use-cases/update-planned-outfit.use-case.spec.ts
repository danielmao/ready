import { NotFoundException } from '@nestjs/common';

import { UpdatePlannedOutfitUseCase } from './update-planned-outfit.use-case';

describe('UpdatePlannedOutfitUseCase', () => {
  const repository = { findActive: jest.fn(), update: jest.fn() };
  const outfits = { findActiveOutfitById: jest.fn() };
  const useCase = new UpdatePlannedOutfitUseCase(
    repository as never,
    outfits as never,
  );

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('rechaza con 404 cuando no hay planeado activo', async () => {
    repository.findActive.mockResolvedValue(null);

    await expect(
      useCase.execute({ outfitId: 'o2' } as never, 'user1'),
    ).rejects.toBeInstanceOf(NotFoundException);
    expect(repository.update).not.toHaveBeenCalled();
  });

  it('valida el nuevo outfit antes de actualizar', async () => {
    repository.findActive.mockResolvedValue({ id: 'p1', outfitId: 'o1' });
    outfits.findActiveOutfitById
      .mockResolvedValueOnce({ id: 'o2' }) // validación del target
      .mockResolvedValueOnce({ id: 'o2', items: [] }); // re-hidratación
    repository.update.mockResolvedValue({ id: 'p1', outfitId: 'o2' });

    await useCase.execute({ outfitId: 'o2' } as never, 'user1');

    expect(repository.update).toHaveBeenCalledWith('p1', {
      outfitId: 'o2',
      plannedFor: undefined,
    });
  });
});
