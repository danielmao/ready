import { useQuery } from '@tanstack/react-query';

import { clothesApi } from '../services/clothesApi';
import { clothesKeys } from './useClothes';

/** Catálogo de categorías (para los selects del alta). */
export function useCategories() {
  return useQuery({
    queryKey: clothesKeys.categories,
    queryFn: () => clothesApi.categories(),
    staleTime: 5 * 60_000, // catálogos casi estáticos
  });
}

/** Catálogo de colores. */
export function useColors() {
  return useQuery({
    queryKey: clothesKeys.colors,
    queryFn: () => clothesApi.colors(),
    staleTime: 5 * 60_000,
  });
}

/** Ocasiones (globales + del usuario). */
export function useOccasions() {
  return useQuery({
    queryKey: clothesKeys.occasions,
    queryFn: () => clothesApi.occasions(),
    staleTime: 5 * 60_000,
  });
}
