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

import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '../../../shared/components/Button';
import { colors as palette, fonts } from '../../../theme';
import { resolveImageUrl } from '../../../shared/utils/resolveImageUrl';
import {
  useCategories,
  useColors,
  useOccasions,
  useTags,
} from '../hooks/useCatalogs';
import { useCreateTag, useUploadClothingImage } from '../hooks/useClothes';
import { ColorSwatchPicker } from './ColorSwatchPicker';
import { TagSelector } from './TagSelector';

const schema = z.object({
  name: z.string().trim().min(1, 'El nombre es obligatorio'),
  categoryId: z.string().uuid('Elegí una categoría'),
  colorId: z.string().uuid('Elegí un color'),
  description: z.string().trim().optional(),
  occasionIds: z.array(z.string().uuid()).optional(),
  tagIds: z.array(z.string().uuid()).optional(),
});

export type ClothingItemFormValues = z.infer<typeof schema>;

interface ClothingItemFormProps {
  submitLabel: string;
  onSubmit: (values: ClothingItemFormValues, imageUrl: string | null) => void;
  defaultValues?: Partial<ClothingItemFormValues>;
  initialImageUrl?: string | null;
  submitting?: boolean;
  /** Si se pasa, renderiza el top bar del diseño 04 (Cancelar / título / Guardar). */
  title?: string;
  onCancel?: () => void;
}

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
    <View className="mt-2 flex-row flex-wrap gap-2.5">
      {options.map((opt) => (
        <Pressable
          key={opt.id}
          onPress={() => toggle(opt.id)}
          className={`rounded-full px-[15px] py-2 ${
            selected(opt.id)
              ? 'bg-primary-soft'
              : 'border border-border bg-surface'
          }`}
        >
          <Text
            className={`text-[13px] ${
              selected(opt.id) ? 'text-primary' : 'text-text-secondary'
            }`}
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
      <Text className="text-xs uppercase tracking-wider text-text-muted">
        {label}
      </Text>
      {children}
      {error ? <Text className="mt-1 text-xs text-error">{error}</Text> : null}
    </View>
  );
}

/**
 * Formulario compartido de prenda (crear y editar), estilo diseño 03. RHF + Zod.
 * La persistencia la decide el consumidor vía `onSubmit(values, imageUrl)`.
 */
export function ClothingItemForm({
  submitLabel,
  onSubmit,
  defaultValues,
  initialImageUrl = null,
  submitting = false,
  title,
  onCancel,
}: ClothingItemFormProps) {
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
    resolver: zodResolver(schema),
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

  const topBar = title ? (
    <View className="flex-row items-center justify-between px-5 pb-3 pt-1">
      <Pressable onPress={onCancel} hitSlop={8}>
        <Text className="text-[15px] text-text-secondary">Cancelar</Text>
      </Pressable>
      <Text
        className="text-[22px] text-text-primary"
        style={{ fontFamily: fonts.serif }}
      >
        {title}
      </Text>
      <Pressable
        testID="form-header-save"
        onPress={submit}
        disabled={!isValid || submitting}
        hitSlop={8}
      >
        <Text
          className={`text-[15px] font-semibold ${
            isValid && !submitting ? 'text-primary' : 'text-text-muted'
          }`}
        >
          Guardar
        </Text>
      </Pressable>
    </View>
  ) : null;

  return (
    <SafeAreaView className="flex-1 bg-background" edges={title ? ['top'] : []}>
      {topBar}
      <ScrollView
        className="flex-1 bg-background"
        contentContainerClassName="p-6 pb-10"
      >
      <View className="mb-5">
        <Text className="mb-2 text-xs uppercase tracking-wider text-text-muted">
          Foto
        </Text>
        <Pressable
          onPress={chooseImageSource}
          disabled={uploadImage.isPending}
          className="h-44 items-center justify-center overflow-hidden rounded-[18px] border border-dashed border-border bg-surface-alt"
        >
          {imageUri ? (
            <>
              <Image
                source={{ uri: imageUri }}
                className="h-44 w-full"
                resizeMode="cover"
              />
              {uploadImage.isPending ? (
                <View className="absolute inset-0 items-center justify-center bg-primary-dark/40">
                  <ActivityIndicator color={palette.text.inverse} />
                </View>
              ) : null}
            </>
          ) : (
            <View className="items-center gap-2.5">
              <View className="h-[52px] w-[52px] items-center justify-center rounded-full bg-primary-soft">
                <Text className="text-2xl text-primary">＋</Text>
              </View>
              <Text className="text-sm text-text-secondary">Agregá una foto</Text>
              <Text className="text-xs text-text-muted">Cámara o galería</Text>
            </View>
          )}
        </Pressable>
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
              placeholder="Ej. Camisa de lino blanca"
              placeholderTextColor={palette.text.muted}
              className="mt-2 rounded-[14px] bg-surface-alt px-4 py-3.5 text-[15px] text-text-primary"
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
            <ColorSwatchPicker
              colors={colors.data ?? []}
              value={value}
              onChange={onChange}
            />
          )}
        />
      </Field>

      <Field label="Ocasiones">
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

      <Field label="Tags">
        <Controller
          control={control}
          name="tagIds"
          render={({ field: { onChange, value } }) => {
            const selected = value ?? [];
            return (
              <TagSelector
                tags={tags.data ?? []}
                selectedIds={selected}
                onToggle={(id) =>
                  onChange(
                    selected.includes(id)
                      ? selected.filter((t) => t !== id)
                      : [...selected, id],
                  )
                }
                onCreate={(name) =>
                  createTag.mutate(name, {
                    onSuccess: (tag) => onChange([...selected, tag.id]),
                  })
                }
              />
            );
          }}
        />
      </Field>

      <Field label="Descripción">
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
              className="mt-2 min-h-[76px] rounded-[14px] bg-surface-alt px-4 py-3.5 text-[15px] text-text-primary"
            />
          )}
        />
      </Field>

      <Button
        label={submitLabel}
        onPress={submit}
        loading={submitting}
        disabled={uploadImage.isPending}
      />
      </ScrollView>
    </SafeAreaView>
  );
}
