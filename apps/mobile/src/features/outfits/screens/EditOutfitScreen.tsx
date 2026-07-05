import { ActivityIndicator, Alert, View } from 'react-native';

import { EmptyState } from '../../../shared/components/EmptyState';
import type { RootStackScreenProps } from '../../../navigation/types';
import { colors } from '../../../theme';
import { OutfitForm } from '../components/OutfitForm';
import { useOutfit, useUpdateOutfit } from '../hooks/useOutfits';

/** Edición de outfit. Prefila `OutfitForm` con el outfit → PUT /api/outfits/:id. */
export function EditOutfitScreen({
  navigation,
  route,
}: RootStackScreenProps<'EditOutfit'>) {
  const { id } = route.params;
  const { data: outfit, isLoading, isError } = useOutfit(id);
  const updateOutfit = useUpdateOutfit();

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator color={colors.primary.DEFAULT} />
      </View>
    );
  }

  if (isError || !outfit) {
    return (
      <View className="flex-1 bg-background">
        <EmptyState
          title="No pudimos cargar el outfit"
          subtitle="Volvé a la lista e intentá de nuevo."
        />
      </View>
    );
  }

  return (
    <OutfitForm
      title="Editar outfit"
      submitLabel="Guardar cambios"
      defaultOutfit={outfit}
      submitting={updateOutfit.isPending}
      onCancel={() => navigation.goBack()}
      onSubmit={(input) =>
        updateOutfit.mutate(
          { id, input },
          {
            onSuccess: () => navigation.goBack(),
            onError: () =>
              Alert.alert('Error', 'No se pudo guardar el outfit. Intentá de nuevo.'),
          },
        )
      }
    />
  );
}
