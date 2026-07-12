import { apiClient } from '../../../services/apiClient';
import { planningApi } from './planningApi';

jest.mock('../../../services/apiClient', () => ({
  apiClient: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  },
}));

const mockPost = apiClient.post as jest.Mock;
const mockPut = apiClient.put as jest.Mock;

describe('planningApi', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('set hace POST /planning con el outfit elegido', async () => {
    const view = { plannedOutfit: { id: 'p1' } };
    mockPost.mockResolvedValue({ data: view });

    const result = await planningApi.set({ outfitId: 'o1' });

    expect(mockPost).toHaveBeenCalledWith('/planning', { outfitId: 'o1' });
    expect(result).toBe(view);
  });

  it('confirm hace PUT /planning/confirm', async () => {
    const planned = { id: 'p1', status: 'confirmed' };
    mockPut.mockResolvedValue({ data: planned });

    const result = await planningApi.confirm();

    expect(mockPut).toHaveBeenCalledWith('/planning/confirm');
    expect(result).toBe(planned);
  });
});
