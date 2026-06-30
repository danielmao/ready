import { ListClothingItemsUseCase } from './list-clothing-items.use-case';

describe('ListClothingItemsUseCase', () => {
  const repository = { findMany: jest.fn() };
  const useCase = new ListClothingItemsUseCase(repository as never);

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('devuelve los items en forma paginada con los filtros del usuario', async () => {
    repository.findMany.mockResolvedValue({ items: [{ id: 'a' }], total: 1 });

    const result = await useCase.execute({ page: 2, limit: 5 } as never, 'user1');

    expect(repository.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ userId: 'user1', page: 2, limit: 5 }),
    );
    expect(result).toEqual({ data: [{ id: 'a' }], total: 1, page: 2, limit: 5 });
  });

  it('aplica page=1 y limit=20 por defecto', async () => {
    repository.findMany.mockResolvedValue({ items: [], total: 0 });

    const result = await useCase.execute({} as never, 'user1');

    expect(result).toEqual({ data: [], total: 0, page: 1, limit: 20 });
  });
});
