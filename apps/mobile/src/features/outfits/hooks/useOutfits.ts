import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

import type {
  CreateOutfitInput,
  UpdateOutfitInput,
} from '../../../domain/models/outfit';
import { outfitsApi, type OutfitsListParams } from '../services/outfitsApi';

/** Query keys centralizadas de la feature outfits. */
export const outfitsKeys = {
  all: ['outfits'] as const,
  list: (params: OutfitsListParams) => ['outfits', 'list', params] as const,
  detail: (id: string) => ['outfits', 'detail', id] as const,
};

/** Lista de outfits (estado servidor). */
export function useOutfits(params: OutfitsListParams = {}) {
  return useQuery({
    queryKey: outfitsKeys.list(params),
    queryFn: () => outfitsApi.list(params),
  });
}

/** Detalle de un outfit por id (pantalla de detalle). */
export function useOutfit(id: string) {
  return useQuery({
    queryKey: outfitsKeys.detail(id),
    queryFn: () => outfitsApi.getById(id),
    enabled: !!id,
  });
}

/** Crea un outfit e invalida el listado para reflejarlo al volver. */
export function useCreateOutfit() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateOutfitInput) => outfitsApi.create(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: outfitsKeys.all });
    },
  });
}

/** Actualiza un outfit e invalida su detalle y el listado. */
export function useUpdateOutfit() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateOutfitInput }) =>
      outfitsApi.update(id, input),
    onSuccess: (_data, { id }) => {
      void queryClient.invalidateQueries({ queryKey: outfitsKeys.all });
      void queryClient.invalidateQueries({ queryKey: outfitsKeys.detail(id) });
    },
  });
}

/** Archiva (borrado lógico) un outfit e invalida el listado. */
export function useArchiveOutfit() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => outfitsApi.archive(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: outfitsKeys.all });
    },
  });
}
