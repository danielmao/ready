import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import type { SetPlannedOutfitInput } from '../../../domain/models/planning';
import { planningApi } from '../services/planningApi';

/** Query keys centralizadas de la feature planning. */
export const planningKeys = {
  all: ['planning'] as const,
  current: ['planning', 'current'] as const,
};

/** El próximo outfit activo (estado servidor). */
export function usePlannedOutfit() {
  return useQuery({
    queryKey: planningKeys.current,
    queryFn: () => planningApi.get(),
  });
}

/** Fija un outfit como el próximo e invalida la vista de planning. */
export function useSetPlannedOutfit() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: SetPlannedOutfitInput) => planningApi.set(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: planningKeys.all });
    },
  });
}

/** Confirma el planeado activo (HU-05) e invalida la vista. */
export function useConfirmPlannedOutfit() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => planningApi.confirm(),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: planningKeys.all });
    },
  });
}

/** Quita el planeado activo e invalida la vista. */
export function useRemovePlannedOutfit() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => planningApi.remove(),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: planningKeys.all });
    },
  });
}
