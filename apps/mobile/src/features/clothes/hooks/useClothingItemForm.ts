import { zodResolver } from '@hookform/resolvers/zod';
import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Alert } from 'react-native';
import { z } from 'zod';

import { resolveImageUrl } from '../../../shared/utils/resolveImageUrl';
import {
  useCategories,
  useColors,
  useOccasions,
  useTags,
} from './useCatalogs';
import { useCreateTag, useUploadClothingImage } from './useClothes';

export const clothingItemSchema = z.object({
  name: z.string().trim().min(1, 'El nombre es obligatorio'),
  categoryId: z.string().uuid('Elegí una categoría'),
  colorId: z.string().uuid('Elegí un color'),
  description: z.string().trim().optional(),
  occasionIds: z.array(z.string().uuid()).optional(),
  tagIds: z.array(z.string().uuid()).optional(),
});

export type ClothingItemFormValues = z.infer<typeof clothingItemSchema>;

/** Opción de chip (categoría/ocasión) ya mapeada para la vista. */
export interface ChipOption {
  id: string;
  label: string;
}

interface UseClothingItemFormParams {
  onSubmit: (values: ClothingItemFormValues, imageUrl: string | null) => void;
  defaultValues?: Partial<ClothingItemFormValues>;
  initialImageUrl?: string | null;
}

/**
 * Controller hook del formulario de prenda (crear/editar). Concentra RHF/Zod, la subida de
 * imagen, los permisos de cámara/galería y el mapeo de catálogos a opciones. La vista
 * (`ClothingItemForm`) queda presentacional y sólo consume lo que este hook devuelve.
 * Ver `docs/CODING-CONVENTIONS.md §5`.
 */
export function useClothingItemForm({
  onSubmit,
  defaultValues,
  initialImageUrl = null,
}: UseClothingItemFormParams) {
  const categories = useCategories();
  const colors = useColors();
  const occasions = useOccasions();
  const tags = useTags();
  const createTag = useCreateTag();
  const uploadImage = useUploadClothingImage();

  // Imagen: uri local (preview) + url pública ya subida al backend.
  const [imageUri, setImageUri] = useState<string | null>(
    initialImageUrl ? resolveImageUrl(initialImageUrl) : null,
  );
  const [imageUrl, setImageUrl] = useState<string | null>(initialImageUrl);

  const handleAsset = (asset: ImagePicker.ImagePickerAsset) => {
    setImageUri(asset.uri);
    setImageUrl(null);
    uploadImage.mutate(
      {
        uri: asset.uri,
        name: asset.fileName ?? asset.uri.split('/').pop() ?? 'photo.jpg',
        type: asset.mimeType ?? 'image/jpeg',
      },
      {
        onSuccess: (img) => setImageUrl(img.url),
        onError: () =>
          Alert.alert('Error', 'No se pudo subir la imagen. Probá de nuevo.'),
      },
    );
  };

  const takePhoto = async () => {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) {
      Alert.alert(
        'Permiso requerido',
        'Necesitamos acceso a la cámara para tomar la foto de la prenda.',
      );
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      quality: 0.7,
    });
    if (result.canceled) return;
    handleAsset(result.assets[0]);
  };

  const pickImage = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert(
        'Permiso requerido',
        'Necesitamos acceso a tus fotos para elegir la imagen de la prenda.',
      );
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.7,
    });
    if (result.canceled) return;
    handleAsset(result.assets[0]);
  };

  const chooseImageSource = () => {
    Alert.alert('Foto de la prenda', '¿De dónde querés sacar la imagen?', [
      { text: 'Tomar foto', onPress: () => void takePhoto() },
      { text: 'Elegir de galería', onPress: () => void pickImage() },
      { text: 'Cancelar', style: 'cancel' },
    ]);
  };

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<ClothingItemFormValues>({
    resolver: zodResolver(clothingItemSchema),
    mode: 'onChange',
    defaultValues: { name: '', occasionIds: [], tagIds: [], ...defaultValues },
  });

  const categoryOptions: ChipOption[] = (categories.data ?? []).map((c) => ({
    id: c.id,
    label: `${c.icon ?? ''} ${c.name}`.trim(),
  }));
  const occasionOptions: ChipOption[] = (occasions.data ?? []).map((o) => ({
    id: o.id,
    label: `${o.icon ?? ''} ${o.name}`.trim(),
  }));

  const submit = handleSubmit((values) => onSubmit(values, imageUrl));

  return {
    form: { control, errors, isValid },
    state: { imageUri },
    data: {
      categoryOptions,
      occasionOptions,
      colors: colors.data ?? [],
      tags: tags.data ?? [],
    },
    actions: { chooseImageSource, submit, createTag: createTag.mutate },
    flags: { uploadPending: uploadImage.isPending },
  };
}
