import { useState } from 'react';

import type { MainTabScreenProps } from '../../../navigation/types';
import {
  useConfirmPlannedOutfit,
  usePlannedOutfit,
  useRemovePlannedOutfit,
} from './usePlanning';

/**
 * Controller hook de la pantalla "Planear": carga del próximo outfit, confirmar/quitar (con
 * su diálogo) y navegación al selector de outfit. La vista (`PlannedOutfitScreen`) queda
 * presentacional (`docs/CODING-CONVENTIONS.md §5`).
 */
export function usePlannedOutfitController(
  navigation: MainTabScreenProps<'PlanearTab'>['navigation'],
) {
  const { data, isLoading, isError, refetch, isRefetching } = usePlannedOutfit();
  const confirm = useConfirmPlannedOutfit();
  const remove = useRemovePlannedOutfit();
  const [confirmRemove, setConfirmRemove] = useState(false);

  const plannedOutfit = data?.plannedOutfit ?? null;
  const outfit = data?.outfit ?? null;
  const items = data?.items ?? [];
  const isConfirmed = plannedOutfit?.status === 'confirmed';

  const handleRemove = () => {
    remove.mutate();
    setConfirmRemove(false);
  };

  return {
    data: { plannedOutfit, outfit, items },
    state: { confirmRemove },
    actions: {
      refetch: () => void refetch(),
      confirm: () => confirm.mutate(),
      askRemove: () => setConfirmRemove(true),
      cancelRemove: () => setConfirmRemove(false),
      handleRemove,
      goToPicker: () => navigation.navigate('PlanPicker'),
      goToDetail: (id: string) => navigation.navigate('OutfitDetail', { id }),
    },
    flags: {
      isLoading,
      isError,
      isRefetching,
      isConfirmed,
      isEmpty: !plannedOutfit || !outfit,
      confirming: confirm.isPending,
      removing: remove.isPending,
    },
  };
}
