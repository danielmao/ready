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

const mockGet = apiClient.get as jest.Mock;
const mockPost = apiClient.post as jest.Mock;
const mockPut = apiClient.put as jest.Mock;
const mockDelete = apiClient.delete as jest.Mock;

describe('planningApi', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('getWeek pide la semana que contiene start', async () => {
    const week = { weekStart: '2026-08-17', days: [] };
    mockGet.mockResolvedValue({ data: week });

    const result = await planningApi.getWeek('2026-08-17');

    expect(mockGet).toHaveBeenCalledWith('/planning/week', {
      params: { start: '2026-08-17' },
    });
    expect(result).toBe(week);
  });

  it('set hace POST /planning con el outfit y el día', async () => {
    const view = { date: '2026-08-19', plannedOutfit: { id: 'p1' } };
    mockPost.mockResolvedValue({ data: view });

    const result = await planningApi.set({ outfitId: 'o1', day: '2026-08-19' });

    expect(mockPost).toHaveBeenCalledWith('/planning', {
      outfitId: 'o1',
      day: '2026-08-19',
    });
    expect(result).toBe(view);
  });

  it('confirm manda el día en el body', async () => {
    mockPut.mockResolvedValue({ data: { id: 'p1', status: 'confirmed' } });

    await planningApi.confirm('2026-08-19');

    expect(mockPut).toHaveBeenCalledWith('/planning/confirm', {
      day: '2026-08-19',
    });
  });

  it('remove libera un día por path', async () => {
    mockDelete.mockResolvedValue({ data: { success: true } });

    await planningApi.remove('2026-08-19');

    expect(mockDelete).toHaveBeenCalledWith('/planning/2026-08-19');
  });
});
