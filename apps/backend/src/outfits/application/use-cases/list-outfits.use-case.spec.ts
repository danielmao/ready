import { ListOutfitsUseCase } from './list-outfits.use-case';

describe('ListOutfitsUseCase', () => {
  const repository = { findMany: jest.fn() };
  const useCase = new ListOutfitsUseCase(repository as never);

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('aplica defaults de paginación y devuelve la forma Paginated', async () => {
    repository.findMany.mockResolvedValue({ items: [{ id: 'o1' }], total: 1 });

    const result = await useCase.execute({}, 'user1');

    expect(repository.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ userId: 'user1', page: 1, limit: 20 }),
    );
    expect(result).toEqual({ data: [{ id: 'o1' }], total: 1, page: 1, limit: 20 });
  });

  it('propaga los filtros (occasionId, clothingId, search)', async () => {
    repository.findMany.mockResolvedValue({ items: [], total: 0 });

    await useCase.execute(
      { occasionId: 'occ1', clothingId: 'c1', search: 'oficina' },
      'user1',
    );

    expect(repository.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        occasionId: 'occ1',
        clothingId: 'c1',
        search: 'oficina',
      }),
    );
  });
});
