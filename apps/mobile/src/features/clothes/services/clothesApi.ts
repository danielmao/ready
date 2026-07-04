import { apiClient } from '../../../services/apiClient';
import type {
  Category,
  ClothingItem,
  Color,
  CreateClothingItemInput,
  LocalImageFile,
  Occasion,
  Paginated,
  UpdateClothingItemInput,
  UploadedImage,
} from '../../../domain/models/clothing';

/** Filtros de listado (espejo de ListClothingItemsQuery del backend). */
export interface ClothesListParams {
  categoryId?: string;
  colorId?: string;
  occasionId?: string;
  tagId?: string;
  search?: string;
  page?: number;
  limit?: number;
}

/** Llamadas HTTP del dominio clothes. Toda comunicación con la API pasa por acá. */
export const clothesApi = {
  async list(params: ClothesListParams = {}): Promise<Paginated<ClothingItem>> {
    const { data } = await apiClient.get<Paginated<ClothingItem>>('/clothes', {
      params,
    });
    return data;
  },

  async getById(id: string): Promise<ClothingItem> {
    const { data } = await apiClient.get<ClothingItem>(`/clothes/${id}`);
    return data;
  },

  async create(input: CreateClothingItemInput): Promise<ClothingItem> {
    const { data } = await apiClient.post<ClothingItem>('/clothes', input);
    return data;
  },

  async update(
    id: string,
    input: UpdateClothingItemInput,
  ): Promise<ClothingItem> {
    const { data } = await apiClient.put<ClothingItem>(`/clothes/${id}`, input);
    return data;
  },

  /** Sube una imagen (multipart) a POST /api/clothes/images y devuelve su URL pública. */
  async uploadImage(file: LocalImageFile): Promise<UploadedImage> {
    const form = new FormData();
    // RN acepta este shape para archivos en FormData (uri/name/type).
    form.append('file', {
      uri: file.uri,
      name: file.name,
      type: file.type,
    } as unknown as Blob);
    const { data } = await apiClient.post<UploadedImage>(
      '/clothes/images',
      form,
      { headers: { 'Content-Type': 'multipart/form-data' } },
    );
    return data;
  },

  async archive(id: string): Promise<{ success: boolean }> {
    const { data } = await apiClient.delete<{ success: boolean }>(
      `/clothes/${id}`,
    );
    return data;
  },

  // Catálogos.
  async categories(): Promise<Category[]> {
    const { data } = await apiClient.get<Category[]>('/clothes/categories');
    return data;
  },

  async colors(): Promise<Color[]> {
    const { data } = await apiClient.get<Color[]>('/clothes/colors');
    return data;
  },

  async occasions(): Promise<Occasion[]> {
    const { data } = await apiClient.get<Occasion[]>('/clothes/occasions');
    return data;
  },
};
