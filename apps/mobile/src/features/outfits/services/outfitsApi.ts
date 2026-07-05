import { apiClient } from '../../../services/apiClient';
import type { Paginated } from '../../../domain/models/clothing';
import type {
  CreateOutfitInput,
  Outfit,
  UpdateOutfitInput,
} from '../../../domain/models/outfit';

/** Filtros de listado (espejo de ListOutfitsQuery del backend). */
export interface OutfitsListParams {
  occasionId?: string;
  tagId?: string;
  clothingId?: string;
  search?: string;
  page?: number;
  limit?: number;
}

/** Llamadas HTTP del dominio outfits. Toda comunicación con la API pasa por acá. */
export const outfitsApi = {
  async list(params: OutfitsListParams = {}): Promise<Paginated<Outfit>> {
    const { data } = await apiClient.get<Paginated<Outfit>>('/outfits', {
      params,
    });
    return data;
  },

  async getById(id: string): Promise<Outfit> {
    const { data } = await apiClient.get<Outfit>(`/outfits/${id}`);
    return data;
  },

  async create(input: CreateOutfitInput): Promise<Outfit> {
    const { data } = await apiClient.post<Outfit>('/outfits', input);
    return data;
  },

  async update(id: string, input: UpdateOutfitInput): Promise<Outfit> {
    const { data } = await apiClient.put<Outfit>(`/outfits/${id}`, input);
    return data;
  },

  async archive(id: string): Promise<{ success: boolean }> {
    const { data } = await apiClient.delete<{ success: boolean }>(
      `/outfits/${id}`,
    );
    return data;
  },
};
