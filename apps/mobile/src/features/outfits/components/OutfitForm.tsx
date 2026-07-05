import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { ClothingItem } from '../../../domain/models/clothing';
import type { CreateOutfitInput, Outfit } from '../../../domain/models/outfit';
import { Button } from '../../../shared/components/Button';
import { colors as palette, fonts } from '../../../theme';
import { resolveImageUrl } from '../../../shared/utils/resolveImageUrl';
import { useOutfitForm, type ChipOption } from '../hooks/useOutfitForm';

interface OutfitFormProps {
  submitLabel: string;
  onSubmit: (input: CreateOutfitInput) => void;
  defaultOutfit?: Outfit;
  submitting?: boolean;
  title: string;
  onCancel: () => void;
}

/** Chip seleccionable (ocasión/tag). */
function Chip({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      className={`rounded-full px-[15px] py-2 ${
        selected ? 'bg-primary-soft' : 'border border-border bg-surface'
      }`}
    >
      <Text
        className={`text-[13px] ${selected ? 'text-primary' : 'text-text-secondary'}`}
      >
        {label}
      </Text>
    </Pressable>
  );
}

/** Prenda seleccionable en la grilla del armario (con check si está en el outfit). */
function PickItem({
  item,
  index,
  onToggle,
}: {
  item: ClothingItem;
  index: number | null;
  onToggle: () => void;
}) {
  const cover = item.imageUrls?.[0] ? resolveImageUrl(item.imageUrls[0]) : undefined;
  const selected = index !== null;
  return (
    <Pressable
      testID="outfit-pick-item"
      onPress={onToggle}
      className={`m-1 flex-1 overflow-hidden rounded-2xl border bg-surface ${
        selected ? 'border-primary' : 'border-surface-alt'
      }`}
    >
      <View className="aspect-square w-full items-center justify-center bg-surface-alt">
        {cover ? (
          <Image source={{ uri: cover }} className="h-full w-full" resizeMode="cover" />
        ) : (
          <Text className="text-3xl">{item.category?.icon ?? '👕'}</Text>
        )}
        {selected ? (
          <View className="absolute right-1.5 top-1.5 h-6 w-6 items-center justify-center rounded-full bg-primary">
            <Text className="text-xs font-bold text-text-inverse">{index + 1}</Text>
          </View>
        ) : null}
      </View>
      <Text className="px-2 py-1.5 text-xs text-text-primary" numberOfLines={1}>
        {item.name}
      </Text>
    </Pressable>
  );
}

/**
 * Formulario compartido de outfit (crear y editar). Vista presentacional: toda la lógica
 * (selección ordenada de prendas, nombre, ocasiones/tags) vive en `useOutfitForm`
 * (`docs/CODING-CONVENTIONS.md §5`). La persistencia la decide el consumidor vía `onSubmit`.
 */
export function OutfitForm({
  submitLabel,
  onSubmit,
  defaultOutfit,
  submitting = false,
  title,
  onCancel,
}: OutfitFormProps) {
  const { state, data, actions, flags } = useOutfitForm({ onSubmit, defaultOutfit });

  const header = (
    <View>
      <View className="flex-row items-center justify-between px-5 pb-2 pt-1">
        <Pressable onPress={onCancel} hitSlop={8}>
          <Text className="text-[15px] text-text-secondary">Cancelar</Text>
        </Pressable>
        <Text
          className="text-[22px] text-text-primary"
          style={{ fontFamily: fonts.serif }}
        >
          {title}
        </Text>
        <View className="w-16" />
      </View>

      <View className="px-5 pt-2">
        <Text className="text-xs uppercase tracking-wider text-text-muted">Nombre</Text>
        <TextInput
          value={state.name}
          onChangeText={actions.setName}
          placeholder="Ej: Look oficina"
          placeholderTextColor={palette.text.muted}
          className="mt-2 rounded-[14px] bg-surface-alt px-4 py-3.5 text-[15px] text-text-primary"
        />
      </View>

      {data.occasionOptions.length > 0 ? (
        <View className="px-5 pt-4">
          <Text className="text-xs uppercase tracking-wider text-text-muted">
            Ocasiones
          </Text>
          <View className="mt-2 flex-row flex-wrap gap-2.5">
            {data.occasionOptions.map((o: ChipOption) => (
              <Chip
                key={o.id}
                label={o.label}
                selected={state.occasionIds.includes(o.id)}
                onPress={() => actions.toggleOccasion(o.id)}
              />
            ))}
          </View>
        </View>
      ) : null}

      {data.tagOptions.length > 0 ? (
        <View className="px-5 pt-4">
          <Text className="text-xs uppercase tracking-wider text-text-muted">Tags</Text>
          <View className="mt-2 flex-row flex-wrap gap-2.5">
            {data.tagOptions.map((t: ChipOption) => (
              <Chip
                key={t.id}
                label={t.label}
                selected={state.tagIds.includes(t.id)}
                onPress={() => actions.toggleTag(t.id)}
              />
            ))}
          </View>
        </View>
      ) : null}

      <View className="px-5 pb-1 pt-5">
        <Text className="text-xs uppercase tracking-wider text-text-muted">
          Prendas · {flags.selectedCount} elegidas (mínimo 2)
        </Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      {flags.isLoadingClothes ? (
        <>
          {header}
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator color={palette.primary.DEFAULT} />
          </View>
        </>
      ) : (
        <FlatList
          data={data.clothes}
          keyExtractor={(it) => it.id}
          numColumns={3}
          ListHeaderComponent={header}
          contentContainerClassName="px-4 pb-28"
          renderItem={({ item }) => {
            const idx = state.selectedIds.indexOf(item.id);
            return (
              <PickItem
                item={item}
                index={idx >= 0 ? idx : null}
                onToggle={() => actions.toggleItem(item.id)}
              />
            );
          }}
        />
      )}

      <View className="absolute bottom-0 left-0 right-0 bg-background px-6 pb-8 pt-3">
        <Button
          label={submitLabel}
          onPress={actions.submit}
          loading={submitting}
          disabled={!flags.canSubmit}
        />
      </View>
    </SafeAreaView>
  );
}
