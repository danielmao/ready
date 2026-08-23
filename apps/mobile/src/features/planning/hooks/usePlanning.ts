import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import type { SetPlannedOutfitInput } from '../../../domain/models/planning';
import { planningApi } from '../services/planningApi';

/** Query keys centralizadas de la feature planning. */
export const planningKeys = {
  all: ['planning'] as const,
  week: (start: string) => ['planning', 'week', start] as const,
};

/** El plan de una semana (estado servidor). `weekStart` = lunes en clave `YYYY-MM-DD`. */
export function useWeekPlan(weekStart: string) {
  return useQuery({
    queryKey: planningKeys.week(weekStart),
    queryFn: () => planningApi.getWeek(weekStart),
  });
}

/**
 * Invalida TODO el árbol de planning tras una mutación. Es a propósito más amplio que la
 * semana tocada: planear un día de otra semana desde el picker también debe refrescarla.
 */
function useInvalidatePlanning() {
  const queryClient = useQueryClient();
  return () => void queryClient.invalidateQueries({ queryKey: planningKeys.all });
}

/** Planea un outfit para un día e invalida la vista. */
export function useSetPlannedOutfit() {
  const invalidate = useInvalidatePlanning();
  return useMutation({
    mutationFn: (input: SetPlannedOutfitInput) => planningApi.set(input),
    onSuccess: invalidate,
  });
}

/** Confirma el planeado de un día (HU-05) e invalida la vista. */
export function useConfirmPlannedOutfit() {
  const invalidate = useInvalidatePlanning();
  return useMutation({
    mutationFn: (day: string) => planningApi.confirm(day),
    onSuccess: invalidate,
  });
}

/** Libera un día del plan e invalida la vista. */
export function useRemovePlannedOutfit() {
  const invalidate = useInvalidatePlanning();
  return useMutation({
    mutationFn: (day: string) => planningApi.remove(day),
    onSuccess: invalidate,
  });
}
