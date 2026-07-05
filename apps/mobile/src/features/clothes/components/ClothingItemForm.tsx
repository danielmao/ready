import { Controller } from 'react-hook-form';
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '../../../shared/components/Button';
import { colors as palette, fonts } from '../../../theme';
import {
  useClothingItemForm,
  type ChipOption,
  type ClothingItemFormValues,
} from '../hooks/useClothingItemForm';
import { ColorSwatchPicker } from './ColorSwatchPicker';
import { SelectField } from './SelectField';
import { TagSelector } from './TagSelector';

// Re-export para consumidores que ya lo importaban desde acá (Add/Edit screens).
export type { ClothingItemFormValues } from '../hooks/useClothingItemForm';

interface ClothingItemFormProps {
  submitLabel: string;
  onSubmit: (values: ClothingItemFormValues, imageUrl: string | null) => void;
  defaultValues?: Partial<ClothingItemFormValues>;
  initialImageUrl?: string | null;
  submitting?: boolean;
  title?: string;
  onCancel?: () => void;
  /**
   * Header + guardado según diseño:
   * - `sheet` (crear, 04): grabber + ✕ arriba-izq; guardado SOLO en el botón inferior.
   * - `bar` (editar, 03): Cancelar / título / Guardar (arriba-der); sin botón inferior.
   */
  variant?: 'sheet' | 'bar';
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
 * Formulario compartido de prenda (crear y editar), estilo diseño 03/04. Vista presentacional:
 * toda la lógica (RHF/Zod, subida de imagen, permisos, mapeos) vive en `useClothingItemForm`
 * (`docs/CODING-CONVENTIONS.md §5`). La persistencia la decide el consumidor vía `onSubmit`.
 */
export function ClothingItemForm({
  submitLabel,
  onSubmit,
  defaultValues,
  initialImageUrl = null,
  submitting = false,
  title,
  onCancel,
  variant = 'sheet',
}: ClothingItemFormProps) {
  const { form, state, data, actions, flags } = useClothingItemForm({
    onSubmit,
    defaultValues,
    initialImageUrl,
  });
  const { control, errors, isValid } = form;

  const header =
    variant === 'bar' ? (
      // Diseño 03 (editar): Cancelar / título / Guardar (arriba-derecha).
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
          onPress={actions.submit}
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
    ) : (
      // Diseño 04 (crear): bottom-sheet — grabber + ✕ arriba-izquierda + título.
      <View className="pt-2.5">
        <View className="mx-auto h-[5px] w-[38px] rounded-[3px] bg-border" />
        <View className="flex-row items-center justify-between px-5 pb-3 pt-3.5">
          <Pressable
            testID="sheet-close"
            onPress={onCancel}
            className="h-[30px] w-[30px] items-center justify-center rounded-full bg-surface-alt"
          >
            <Text className="text-base text-text-secondary">✕</Text>
          </Pressable>
          <Text
            className="text-2xl text-text-primary"
            style={{ fontFamily: fonts.serif }}
          >
            {title}
          </Text>
          <View className="w-[30px]" />
        </View>
        <View className="h-px bg-border" />
      </View>
    );

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      {title ? header : null}
      <ScrollView
        className="flex-1 bg-background"
        contentContainerClassName="px-6 pb-8 pt-4"
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="interactive"
        automaticallyAdjustKeyboardInsets
      >
      <View className="mb-5">
        <Text className="mb-2 text-xs uppercase tracking-wider text-text-muted">
          Foto
        </Text>
        <Pressable
          onPress={actions.chooseImageSource}
          disabled={flags.uploadPending}
          className="aspect-[4/3] w-full items-center justify-center overflow-hidden rounded-[18px] border-[1.5px] border-dashed border-border bg-surface-alt"
        >
          {state.imageUri ? (
            <>
              <Image
                source={{ uri: state.imageUri }}
                className="h-full w-full"
                resizeMode="cover"
              />
              {flags.uploadPending ? (
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
              placeholder="Ej: Camisa de lino blanca"
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
            <SelectField
              options={data.categoryOptions}
              value={value}
              placeholder="Elegí una categoría"
              onChange={onChange}
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
              colors={data.colors}
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
              options={data.occasionOptions}
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
                tags={data.tags}
                selectedIds={selected}
                onToggle={(id) =>
                  onChange(
                    selected.includes(id)
                      ? selected.filter((t) => t !== id)
                      : [...selected, id],
                  )
                }
                onCreate={(name) =>
                  actions.createTag(name, {
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
              placeholder="Añadí una nota sobre la prenda (opcional)"
              placeholderTextColor={palette.text.muted}
              multiline
              className="mt-2 min-h-[76px] rounded-[14px] bg-surface-alt px-4 py-3.5 text-[15px] text-text-primary"
            />
          )}
        />
      </Field>

      </ScrollView>
      {variant !== 'bar' ? (
        <View className="px-6 pb-8 pt-3">
          <Button
            label={submitLabel}
            onPress={actions.submit}
            loading={submitting}
            disabled={flags.uploadPending}
          />
        </View>
      ) : null}
    </SafeAreaView>
  );
}
