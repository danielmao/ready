import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

import type {
  CreateClothingItemInput,
  LocalImageFile,
} from '../../../domain/models/clothing';
import { clothesApi, type ClothesListParams } from '../services/clothesApi';

/** Query keys centralizadas de la feature clothes. */
export const clothesKeys = {
  all: ['clothes'] as const,
  list: (params: ClothesListParams) => ['clothes', 'list', params] as const,
  detail: (id: string) => ['clothes', 'detail', id] as const,
  categories: ['clothes', 'categories'] as const,
  colors: ['clothes', 'colors'] as const,
  occasions: ['clothes', 'occasions'] as const,
};

/** Lista de prendas (estado servidor). */
export function useClothes(params: ClothesListParams = {}) {
  return useQuery({
    queryKey: clothesKeys.list(params),
    queryFn: () => clothesApi.list(params),
  });
}

/** Crea una prenda e invalida el listado para reflejarla al volver. */
export function useCreateClothingItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateClothingItemInput) => clothesApi.create(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: clothesKeys.all });
    },
  });
}

/** Sube una imagen y devuelve su URL pública (para meter en imageUrls al crear). */
export function useUploadClothingImage() {
  return useMutation({
    mutationFn: (file: LocalImageFile) => clothesApi.uploadImage(file),
  });
}

/** Archiva (borrado lógico) una prenda e invalida el listado. */
export function useArchiveClothingItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => clothesApi.archive(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: clothesKeys.all });
    },
  });
}
