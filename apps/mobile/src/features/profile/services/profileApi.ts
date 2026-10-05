import type { User } from '../../../domain/models/user';
import { apiClient } from '../../../services/apiClient';

/** Llamadas HTTP del perfil. El backend resuelve "me" desde el token de la request. */
export const profileApi = {
  async me(): Promise<User> {
    const { data } = await apiClient.get<User>('/users/me');
    return data;
  },

  async updateMe(input: { name: string }): Promise<User> {
    const { data } = await apiClient.put<User>('/users/me', input);
    return data;
  },
};
