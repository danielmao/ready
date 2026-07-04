import { Alert } from 'react-native';

import type { RootStackScreenProps } from '../../../navigation/types';
import { ClothingItemForm } from '../components/ClothingItemForm';
import { useCreateClothingItem } from '../hooks/useClothes';

/** Alta de prenda. Reusa `ClothingItemForm` → POST /api/clothes vía useCreateClothingItem. */
export function AddClothingItemScreen({
  navigation,
}: RootStackScreenProps<'AddClothingItem'>) {
  const createItem = useCreateClothingItem();

  return (
    <ClothingItemForm
      title="Nueva prenda"
      onCancel={() => navigation.goBack()}
      submitLabel="Guardar prenda"
      submitting={createItem.isPending}
      onSubmit={(values, imageUrl) =>
        createItem.mutate(
          {
            name: values.name,
            categoryId: values.categoryId,
            colorId: values.colorId,
            description: values.description || undefined,
            occasionIds: values.occasionIds,
            tagIds: values.tagIds,
            imageUrls: imageUrl ? [imageUrl] : undefined,
          },
          {
            onSuccess: () => navigation.goBack(),
            onError: () =>
              Alert.alert('Error', 'No se pudo crear la prenda. Intentá de nuevo.'),
          },
        )
      }
    />
  );
}
