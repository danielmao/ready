import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { ClothingItem } from '../../../domain/models/clothing';
import type { CreateOutfitInput, Outfit } from '../../../domain/models/outfit';
import { Button } from '../../../shared/components/Button';
import { EmptyState } from '../../../shared/components/EmptyState';
import { colors as palette, fonts } from '../../../theme';
import { resolveImageUrl } from '../../../shared/utils/resolveImageUrl';
import { FilterChips } from '../../clothes/components/FilterChips';
import { SearchBar } from '../../clothes/components/SearchBar';
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

/** Miniatura de una prenda ya elegida en la bandeja "Tu outfit", con orden y quitar. */
function TrayItem({
  item,
  order,
  onRemove,
}: {
  item: ClothingItem;
  order: number;
  onRemove: () => void;
}) {
  const cover = item.imageUrls?.[0] ? resolveImageUrl(item.imageUrls[0]) : undefined;
  return (
    <View className="mr-2.5 w-14">
      <View className="h-14 w-14 items-center justify-center overflow-hidden rounded-xl border border-primary bg-surface-alt">
        {cover ? (
          <Image source={{ uri: cover }} className="h-full w-full" resizeMode="cover" />
        ) : (
          <Text className="text-xl">{item.category?.icon ?? '👕'}</Text>
        )}
        <View className="absolute left-1 top-1 h-5 w-5 items-center justify-center rounded-full bg-primary">
          <Text className="text-[10px] font-bold text-text-inverse">{order}</Text>
        </View>
        <Pressable
          testID="tray-remove"
          onPress={onRemove}
          hitSlop={10}
          accessibilityLabel={`Quitar ${item.name}`}
          className="absolute right-0.5 top-0.5 h-4 w-4 items-center justify-center rounded-full bg-primary-dark/80"
        >
          <Text className="text-[9px] font-bold text-text-inverse">✕</Text>
        </Pressable>
      </View>
      <Text className="mt-1 text-[10px] text-text-muted" numberOfLines={1}>
        {item.name}
      </Text>
    </View>
  );
}

/** Prenda seleccionable en la grilla del armario (con orden si está en el outfit). */
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
 * Formulario compartido de outfit (crear y editar). Vista presentacional: toda la lógica vive
 * en `useOutfitForm` (`docs/CODING-CONVENTIONS.md §5`). La persistencia la decide el consumidor.
 * Layout (UX): nombre + ocasiones/tags (arriba, scroll corto), luego zona FIJA con la bandeja
 * "Tu outfit" + buscador + filtro por categoría, y la grilla del armario scrolleable debajo.
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

  const countLabel =
    flags.selectedCount < 2
      ? `${flags.selectedCount} elegidas · mínimo 2`
      : `${flags.selectedCount} elegidas`;

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      {/* Barra título */}
      <View className="flex-row items-center justify-between px-5 pb-2 pt-1">
        <Pressable onPress={onCancel} hitSlop={8}>
          <Text className="text-[15px] text-text-secondary">Cancelar</Text>
        </Pressable>
        <Text className="text-[22px] text-text-primary" style={{ fontFamily: fonts.serif }}>
          {title}
        </Text>
        <View className="w-16" />
      </View>

      {/* Nombre + metadata (scroll corto propio) */}
      <View className="px-5">
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
        <View className="px-5 pt-3">
          <Text className="text-xs uppercase tracking-wider text-text-muted">Ocasiones</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerClassName="mt-2 gap-2.5 pr-5"
          >
            {data.occasionOptions.map((o: ChipOption) => (
              <Chip
                key={o.id}
                label={o.label}
                selected={state.occasionIds.includes(o.id)}
                onPress={() => actions.toggleOccasion(o.id)}
              />
            ))}
          </ScrollView>
        </View>
      ) : null}

      {/* Zona fija: bandeja "Tu outfit" + buscador + filtro por categoría */}
      <View className="mt-3 border-t border-border pt-3">
        <View className="flex-row items-center justify-between px-5">
          <Text className="text-xs uppercase tracking-wider text-text-muted">Tu outfit</Text>
          <Text className="text-xs text-text-muted">{countLabel}</Text>
        </View>

        {data.selectedItems.length > 0 ? (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerClassName="px-5 pt-2.5"
          >
            {data.selectedItems.map((item, idx) => (
              <TrayItem
                key={item.id}
                item={item}
                order={idx + 1}
                onRemove={() => actions.removeItem(item.id)}
              />
            ))}
          </ScrollView>
        ) : (
          <Text className="px-5 pt-2.5 text-[13px] text-text-muted">
            Tocá las prendas para armar tu outfit.
          </Text>
        )}

        <View className="px-5 pb-1 pt-3">
          <SearchBar
            value={state.search}
            onChangeText={actions.setSearch}
            placeholder="Buscar en tu armario…"
          />
        </View>
        <View className="pt-2">
          <FilterChips
            categories={data.categoryOptions}
            selectedId={state.categoryId}
            onSelect={actions.setCategoryId}
          />
        </View>
      </View>

      {/* Grilla del armario (scrolleable) */}
      {flags.isLoadingClothes ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color={palette.primary.DEFAULT} />
        </View>
      ) : data.clothes.length === 0 ? (
        <View className="flex-1">
          <EmptyState
            title={flags.isFiltering ? 'Sin resultados' : 'Tu armario está vacío'}
            subtitle={
              flags.isFiltering
                ? 'Probá con otra búsqueda o cambiá de categoría.'
                : 'Agregá prendas antes de armar un outfit.'
            }
          />
        </View>
      ) : (
        <FlatList
          data={data.clothes}
          keyExtractor={(it) => it.id}
          numColumns={3}
          contentContainerClassName="px-4 pb-28 pt-1"
          keyboardShouldPersistTaps="handled"
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

      {/* CTA fijo */}
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
