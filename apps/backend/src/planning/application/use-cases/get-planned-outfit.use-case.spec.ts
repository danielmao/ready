import { GetPlannedOutfitUseCase } from './get-planned-outfit.use-case';

describe('GetPlannedOutfitUseCase', () => {
  const repository = { findActive: jest.fn() };
  const outfits = { findActiveOutfitById: jest.fn() };
  const useCase = new GetPlannedOutfitUseCase(
    repository as never,
    outfits as never,
  );

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('devuelve la vista vacía cuando no hay planeado activo', async () => {
    repository.findActive.mockResolvedValue(null);

    const result = await useCase.execute('user1');

    expect(result).toEqual({ plannedOutfit: null, outfit: null, items: [] });
    expect(outfits.findActiveOutfitById).not.toHaveBeenCalled();
  });

  it('hidrata el outfit y sus prendas cuando hay planeado', async () => {
    const planned = { id: 'p1', outfitId: 'o1' };
    const items = [{ id: 'i1' }, { id: 'i2' }];
    repository.findActive.mockResolvedValue(planned);
    outfits.findActiveOutfitById.mockResolvedValue({ id: 'o1', items });

    const result = await useCase.execute('user1');

    expect(outfits.findActiveOutfitById).toHaveBeenCalledWith('o1', 'user1');
    expect(result.items).toBe(items);
  });
});
