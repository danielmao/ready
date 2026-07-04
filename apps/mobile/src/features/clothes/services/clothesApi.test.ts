import { apiClient } from '../../../services/apiClient';
import { clothesApi } from './clothesApi';

jest.mock('../../../services/apiClient', () => ({
  apiClient: { put: jest.fn(), post: jest.fn() },
}));

const mockPut = apiClient.put as jest.Mock;

describe('clothesApi.update', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('hace PUT /clothes/:id con el body y devuelve la prenda', async () => {
    const updated = { id: 'c1', name: 'Remera nueva' };
    mockPut.mockResolvedValue({ data: updated });

    const result = await clothesApi.update('c1', { name: 'Remera nueva' });

    expect(mockPut).toHaveBeenCalledWith('/clothes/c1', {
      name: 'Remera nueva',
    });
    expect(result).toBe(updated);
  });
});
