import { Alert } from 'react-native';

import type { RootStackScreenProps } from '../../../navigation/types';
import { OutfitForm } from '../components/OutfitForm';
import { useCreateOutfit } from '../hooks/useOutfits';

/** Alta de outfit. Reusa `OutfitForm` → POST /api/outfits vía useCreateOutfit. */
export function AddOutfitScreen({
  navigation,
}: RootStackScreenProps<'AddOutfit'>) {
  const createOutfit = useCreateOutfit();

  return (
    <OutfitForm
      title="Nuevo outfit"
      submitLabel="Guardar outfit"
      submitting={createOutfit.isPending}
      onCancel={() => navigation.goBack()}
      onSubmit={(input) =>
        createOutfit.mutate(input, {
          onSuccess: () => navigation.goBack(),
          onError: () =>
            Alert.alert('Error', 'No se pudo crear el outfit. Intentá de nuevo.'),
        })
      }
    />
  );
}
