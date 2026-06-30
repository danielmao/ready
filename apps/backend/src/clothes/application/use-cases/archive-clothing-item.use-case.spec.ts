import { NotFoundException } from '@nestjs/common';

import { ArchiveClothingItemUseCase } from './archive-clothing-item.use-case';

describe('ArchiveClothingItemUseCase', () => {
  const repository = { findActiveById: jest.fn(), archive: jest.fn() };
  const useCase = new ArchiveClothingItemUseCase(repository as never);

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('archiva (lógico) una prenda activa existente', async () => {
    repository.findActiveById.mockResolvedValue({ id: 'c1' });

    const result = await useCase.execute('c1', 'user1');

    expect(repository.archive).toHaveBeenCalledWith('c1', 'user1');
    expect(result).toEqual({ success: true });
  });

  it('lanza 404 y no archiva si la prenda no existe o ya está archivada', async () => {
    repository.findActiveById.mockResolvedValue(null);

    await expect(useCase.execute('x', 'user1')).rejects.toBeInstanceOf(
      NotFoundException,
    );
    expect(repository.archive).not.toHaveBeenCalled();
  });
});
