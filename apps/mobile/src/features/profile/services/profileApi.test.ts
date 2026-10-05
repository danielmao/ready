import { apiClient } from '../../../services/apiClient';
import { profileApi } from './profileApi';

jest.mock('../../../services/apiClient', () => ({
  apiClient: { get: jest.fn(), put: jest.fn() },
}));

const mockPut = apiClient.put as jest.Mock;

describe('profileApi.updateMe', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('hace PUT /users/me con el body y devuelve el usuario actualizado', async () => {
    const updated = { id: 'u1', name: 'Ana' };
    mockPut.mockResolvedValue({ data: updated });

    const result = await profileApi.updateMe({ name: 'Ana' });

    expect(mockPut).toHaveBeenCalledWith('/users/me', { name: 'Ana' });
    expect(result).toBe(updated);
  });
});
