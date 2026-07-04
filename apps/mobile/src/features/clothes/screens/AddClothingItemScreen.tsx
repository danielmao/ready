import { zodResolver } from '@hookform/resolvers/zod';
import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { z } from 'zod';

import { colors as palette } from '../../../theme';
import { Button } from '../../../shared/components/Button';
import type { RootStackScreenProps } from '../../../navigation/types';
import {
  useCategories,
  useColors,
  useOccasions,
} from '../hooks/useCatalogs';
import {
  useCreateClothingItem,
  useUploadClothingImage,
} from '../hooks/useClothes';

const schema = z.object({
  name: z.string().trim().min(1, 'El nombre es obligatorio'),
  categoryId: z.string().uuid('Elegí una categoría'),
  colorId: z.string().uuid('Elegí un color'),
  description: z.string().trim().optional(),
  occasionIds: z.array(z.string().uuid()).optional(),
});

type FormValues = z.infer<typeof schema>;

interface ChipOption {
  id: string;
  label: string;
}

/** Selector de chips (una o varias). RN puro; reemplaza pickers nativos en el MVP. */
function ChipGroup({
  options,
  value,
  onChange,
  multiple = false,
}: {
  options: ChipOption[];
  value: string | string[] | undefined;
  onChange: (next: string | string[]) => void;
  multiple?: boolean;
}) {
  const selected = (id: string) =>
    multiple ? (value as string[] | undefined)?.includes(id) : value === id;

  const toggle = (id: string) => {
    if (!multiple) {
      onChange(id);
      return;
    }
    const current = (value as string[] | undefined) ?? [];
    onChange(
      current.includes(id)
        ? current.filter((v) => v !== id)
        : [...current, id],
    );
  };

  return (
    <View className="mt-2 flex-row flex-wrap gap-2">
      {options.map((opt) => (
        <Pressable
          key={opt.id}
          onPress={() => toggle(opt.id)}
          className={`rounded-full border px-3.5 py-2 ${
            selected(opt.id)
              ? 'border-primary bg-primary'
              : 'border-border bg-surface'
          }`}
        >
          <Text
            className={
              selected(opt.id)
                ? 'text-sm text-text-inverse'
                : 'text-sm text-text-primary'
            }
          >
            {opt.label}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <View className="mb-5">
      <Text className="text-sm font-semibold text-text-primary">{label}</Text>
      {children}
      {error ? <Text className="mt-1 text-xs text-error">{error}</Text> : null}
    </View>
  );
}

/** Alta de prenda. Form con RHF + Zod → POST /api/clothes vía useCreateClothingItem. */
export function AddClothingItemScreen({
  navigation,
}: RootStackScreenProps<'AddClothingItem'>) {
  const categories = useCategories();
  const colors = useColors();
  const occasions = useOccasions();
  const createItem = useCreateClothingItem();
  const uploadImage = useUploadClothingImage();

  // Imagen de la prenda: uri local (preview) + url pública ya subida al backend.
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  // Sube el asset elegido (cámara o galería) al backend y refleja el preview.
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

  // Menú de origen de la imagen: cámara o galería.
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
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', occasionIds: [] },
  });

  const categoryOptions: ChipOption[] = (categories.data ?? []).map((c) => ({
    id: c.id,
    label: `${c.icon ?? ''} ${c.name}`.trim(),
  }));
  const colorOptions: ChipOption[] = (colors.data ?? []).map((c) => ({
    id: c.id,
    label: c.name,
  }));
  const occasionOptions: ChipOption[] = (occasions.data ?? []).map((o) => ({
    id: o.id,
    label: `${o.icon ?? ''} ${o.name}`.trim(),
  }));

  const onSubmit = (values: FormValues) => {
    createItem.mutate(
      {
        name: values.name,
        categoryId: values.categoryId,
        colorId: values.colorId,
        description: values.description || undefined,
        occasionIds: values.occasionIds,
        imageUrls: imageUrl ? [imageUrl] : undefined,
      },
      {
        onSuccess: () => navigation.goBack(),
        onError: () =>
          Alert.alert('Error', 'No se pudo crear la prenda. Intentá de nuevo.'),
      },
    );
  };

  return (
    <ScrollView className="flex-1 bg-background" contentContainerClassName="p-4">
      <View className="mb-5">
        <Text className="text-sm font-semibold text-text-primary">Foto</Text>
        <Pressable
          onPress={chooseImageSource}
          disabled={uploadImage.isPending}
          className="mt-2 h-40 items-center justify-center overflow-hidden rounded-xl border border-dashed border-border bg-surface"
        >
          {imageUri ? (
            <>
              <Image
                source={{ uri: imageUri }}
                className="h-40 w-full"
                resizeMode="cover"
              />
              {uploadImage.isPending ? (
                <View className="absolute inset-0 items-center justify-center bg-primary-dark/40">
                  <ActivityIndicator color={palette.text.inverse} />
                </View>
              ) : null}
            </>
          ) : (
            <View className="items-center">
              <Text className="text-3xl">📷</Text>
              <Text className="mt-1 text-sm text-text-secondary">
                Tomá o elegí una foto (opcional)
              </Text>
            </View>
          )}
        </Pressable>
        {uploadImage.isError ? (
          <Text className="mt-1 text-xs text-error">
            No se pudo subir la imagen. Tocá para reintentar.
          </Text>
        ) : null}
      </View>

      <Field label="Nombre" error={errors.name?.message}>
        <Controller
          control={control}
          name="name"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              placeholder="Ej. Remera azul"
              placeholderTextColor={palette.text.muted}
              className="mt-2 rounded-xl border border-border bg-surface px-4 py-3 text-base text-text-primary"
            />
          )}
        />
      </Field>

      <Field label="Categoría" error={errors.categoryId?.message}>
        <Controller
          control={control}
          name="categoryId"
          render={({ field: { onChange, value } }) => (
            <ChipGroup
              options={categoryOptions}
              value={value}
              onChange={(next) => onChange(next as string)}
            />
          )}
        />
      </Field>

      <Field label="Color" error={errors.colorId?.message}>
        <Controller
          control={control}
          name="colorId"
          render={({ field: { onChange, value } }) => (
            <ChipGroup
              options={colorOptions}
              value={value}
              onChange={(next) => onChange(next as string)}
            />
          )}
        />
      </Field>

      <Field label="Ocasiones (opcional)">
        <Controller
          control={control}
          name="occasionIds"
          render={({ field: { onChange, value } }) => (
            <ChipGroup
              multiple
              options={occasionOptions}
              value={value}
              onChange={(next) => onChange(next as string[])}
            />
          )}
        />
      </Field>

      <Field label="Descripción (opcional)">
        <Controller
          control={control}
          name="description"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              placeholder="Algodón, manga corta…"
              placeholderTextColor={palette.text.muted}
              multiline
              className="mt-2 min-h-[72px] rounded-xl border border-border bg-surface px-4 py-3 text-base text-text-primary"
            />
          )}
        />
      </Field>

      <Button
        label="Guardar prenda"
        onPress={handleSubmit(onSubmit)}
        loading={createItem.isPending}
        disabled={uploadImage.isPending}
      />
    </ScrollView>
  );
}
