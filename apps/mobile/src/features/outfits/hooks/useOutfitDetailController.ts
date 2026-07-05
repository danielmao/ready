import { useState } from 'react';

import type { RootStackScreenProps } from '../../../navigation/types';
import { useArchiveOutfit, useOutfit } from './useOutfits';

/**
 * Controller hook del detalle de outfit: carga, confirmación de archivado y navegación. La vista
 * (`OutfitDetailScreen`) queda presentacional (`docs/CODING-CONVENTIONS.md §5`).
 */
export function useOutfitDetailController(
  id: string,
  navigation: RootStackScreenProps<'OutfitDetail'>['navigation'],
) {
  const { data: outfit, isLoading, isError } = useOutfit(id);
  const archive = useArchiveOutfit();
  const [confirmArchive, setConfirmArchive] = useState(false);

  const handleArchive = () => {
    archive.mutate(id);
    setConfirmArchive(false);
    navigation.goBack();
  };

  return {
    data: { outfit },
    state: { confirmArchive },
    actions: {
      askArchive: () => setConfirmArchive(true),
      cancelArchive: () => setConfirmArchive(false),
      handleArchive,
      goBack: () => navigation.goBack(),
      goToEdit: () => navigation.navigate('EditOutfit', { id }),
    },
    flags: {
      isLoading,
      isError,
      archiving: archive.isPending,
    },
  };
}
