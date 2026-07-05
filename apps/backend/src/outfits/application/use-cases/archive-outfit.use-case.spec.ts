import { NotFoundException } from '@nestjs/common';

import { ArchiveOutfitUseCase } from './archive-outfit.use-case';

describe('ArchiveOutfitUseCase', () => {
  const repository = { findActiveById: jest.fn(), archive: jest.fn() };
  const useCase = new ArchiveOutfitUseCase(repository as never);

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('archiva el outfit y devuelve success', async () => {
    repository.findActiveById.mockResolvedValue({ id: 'o1' });

    const result = await useCase.execute('o1', 'user1');

    expect(repository.archive).toHaveBeenCalledWith('o1', 'user1');
    expect(result).toEqual({ success: true });
  });

  it('404 si el outfit no existe o ya está archivado', async () => {
    repository.findActiveById.mockResolvedValue(null);

    await expect(useCase.execute('o1', 'user1')).rejects.toBeInstanceOf(
      NotFoundException,
    );
    expect(repository.archive).not.toHaveBeenCalled();
  });
});
