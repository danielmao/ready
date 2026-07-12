import { useState } from 'react';

import type { RootStackScreenProps } from '../../../navigation/types';
import { useOutfits } from '../../outfits/hooks/useOutfits';
import { useSetPlannedOutfit } from './usePlanning';

/**
 * Controller hook del selector de outfit a planear: lista los outfits, busca, y al elegir uno
 * lo fija como el próximo y vuelve. La vista (`PlanPickerScreen`) queda presentacional.
 */
export function usePlanPickerController(
  navigation: RootStackScreenProps<'PlanPicker'>['navigation'],
) {
  const [search, setSearch] = useState('');
  const { data, isLoading, isError, refetch, isRefetching } = useOutfits({
    search: search.trim() || undefined,
  });
  const setPlanned = useSetPlannedOutfit();

  const items = data?.data ?? [];
  const isFiltering = search.trim().length > 0;

  const pick = (outfitId: string) => {
    setPlanned.mutate(
      { outfitId },
      { onSuccess: () => navigation.goBack() },
    );
  };

  return {
    state: { search },
    data: { items },
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
