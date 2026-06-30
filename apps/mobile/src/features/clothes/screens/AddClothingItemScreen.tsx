import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import {
  Alert,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { z } from 'zod';

import { Button } from '../../../shared/components/Button';
import type { RootStackScreenProps } from '../../../navigation/types';
import {
  useCategories,
  useColors,
  useOccasions,
} from '../hooks/useCatalogs';
import { useCreateClothingItem } from '../hooks/useClothes';

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
              : 'border-slate-300 bg-white'
          }`}
        >
          <Text
            className={
              selected(opt.id) ? 'text-sm text-white' : 'text-sm text-ink'
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
      <Text className="text-sm font-semibold text-ink">{label}</Text>
      {children}
      {error ? <Text className="mt-1 text-xs text-red-500">{error}</Text> : null}
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
      },
      {
        onSuccess: () => navigation.goBack(),
        onError: () =>
          Alert.alert('Error', 'No se pudo crear la prenda. Intentá de nuevo.'),
      },
    );
  };

  return (
    <ScrollView className="flex-1 bg-surface" contentContainerClassName="p-4">
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
              placeholderTextColor="#94A3B8"
              className="mt-2 rounded-xl border border-slate-300 bg-white px-4 py-3 text-base text-ink"
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
              placeholderTextColor="#94A3B8"
              multiline
              className="mt-2 min-h-[72px] rounded-xl border border-slate-300 bg-white px-4 py-3 text-base text-ink"
            />
          )}
        />
      </Field>

      <Button
        label="Guardar prenda"
        onPress={handleSubmit(onSubmit)}
        loading={createItem.isPending}
      />
    </ScrollView>
  );
}
