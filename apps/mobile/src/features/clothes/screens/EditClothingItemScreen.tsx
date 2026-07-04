import { ActivityIndicator, Alert, View } from 'react-native';

import type { RootStackScreenProps } from '../../../navigation/types';
import { colors } from '../../../theme';
import { ClothingItemForm } from '../components/ClothingItemForm';
import {
  useClothingItem,
  useUpdateClothingItem,
} from '../hooks/useClothes';

/**
 * Pantalla 03 · Editar prenda. Precarga la prenda y reusa `ClothingItemForm`;
 * al guardar hace PUT /clothes/:id vía useUpdateClothingItem.
 */
export function EditClothingItemScreen({
  navigation,
  route,
}: RootStackScreenProps<'EditClothingItem'>) {
  const { id } = route.params;
  const { data: item, isLoading } = useClothingItem(id);
  const update = useUpdateClothingItem();

  if (isLoading || !item) {
    return (
      <View
        testID="edit-loading"
        className="flex-1 items-center justify-center bg-background"
      >
        <ActivityIndicator color={colors.primary.DEFAULT} />
      </View>
    );
  }

  return (
    <ClothingItemForm
      submitLabel="Guardar cambios"
      submitting={update.isPending}
      initialImageUrl={item.imageUrls?.[0] ?? null}
      defaultValues={{
        name: item.name,
        categoryId: item.categoryId,
        colorId: item.colorId,
        description: item.description ?? undefined,
        occasionIds: item.occasions?.map((o) => o.id) ?? [],
      }}
      onSubmit={(values, imageUrl) =>
        update.mutate(
          {
            id,
            input: {
              name: values.name,
              categoryId: values.categoryId,
              colorId: values.colorId,
              description: values.description || undefined,
              occasionIds: values.occasionIds,
              imageUrls: imageUrl ? [imageUrl] : undefined,
            },
          },
          {
            onSuccess: () => navigation.goBack(),
            onError: () =>
              Alert.alert('Error', 'No se pudo guardar. Intentá de nuevo.'),
          },
        )
      }
    />
  );
}
