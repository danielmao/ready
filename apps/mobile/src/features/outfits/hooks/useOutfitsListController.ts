import { useState } from 'react';

import type { MainTabScreenProps } from '../../../navigation/types';
import { useOutfits } from './useOutfits';

/**
 * Controller hook de la pantalla de lista de outfits: búsqueda + orquestación del data hook +
 * navegación. La vista (`OutfitsListScreen`) queda presentacional (`docs/CODING-CONVENTIONS.md §5`).
 */
export function useOutfitsListController(
  navigation: MainTabScreenProps<'OutfitsTab'>['navigation'],
) {
  const [search, setSearch] = useState('');

  const { data, isLoading, isError, refetch, isRefetching } = useOutfits({
    search: search.trim() || undefined,
  });

  const items = data?.data ?? [];
  const isFiltering = search.trim().length > 0;

  return {
    state: { search },
    data: { items },
    actions: {
      setSearch,
      refetch: () => void refetch(),
      goToDetail: (id: string) => navigation.navigate('OutfitDetail', { id }),
      goToCreate: () => navigation.navigate('AddOutfit'),
    },
    flags: {
      isLoading,
      isError,
      isRefetching,
      isFiltering,
      isEmpty: items.length === 0 && !isFiltering,
    },
  };
}
