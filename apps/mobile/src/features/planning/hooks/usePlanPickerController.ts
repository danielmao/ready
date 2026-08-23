import { useState } from 'react';

import type { RootStackScreenProps } from '../../../navigation/types';
import { useOutfits } from '../../outfits/hooks/useOutfits';
import { useSetPlannedOutfit } from './usePlanning';

/**
 * Controller hook del selector de outfit: lista los outfits, busca, y al elegir uno lo planea
 * para el día que trajo la ruta y vuelve. La vista (`PlanPickerScreen`) queda presentacional.
 */
export function usePlanPickerController(
  navigation: RootStackScreenProps<'PlanPicker'>['navigation'],
  day: string,
) {
  const [search, setSearch] = useState('');
  const { data, isLoading, isError, refetch, isRefetching } = useOutfits({
    search: search.trim() || undefined,
  });
  const setPlanned = useSetPlannedOutfit();

  const items = data?.data ?? [];
  const isFiltering = search.trim().length > 0;

  const pick = (outfitId: string) => {
    setPlanned.mutate({ outfitId, day }, { onSuccess: () => navigation.goBack() });
  };

  return {
    state: { search },
    data: { items, day },
    actions: {
      setSearch,
      refetch: () => void refetch(),
      pick,
      goBack: () => navigation.goBack(),
    },
    flags: {
      isLoading,
      isError,
      isRefetching,
      isFiltering,
      isEmpty: items.length === 0 && !isFiltering,
      saving: setPlanned.isPending,
    },
  };
}
