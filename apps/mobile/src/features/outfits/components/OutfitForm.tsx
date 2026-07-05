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
  /** Navega al armario (CTA "Ir a mi armario" del estado vacío). Por defecto vuelve atrás. */
  onGoToWardrobe?: () => void;
}

/** Chip de ocasión seleccionable (compacto, con ✓ al elegir). */
function OccasionChip({
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
      className={`h-[30px] flex-row items-center rounded-[15px] px-[13px] ${
        selected ? 'bg-primary-soft' : 'border border-border bg-surface'
      }`}
    >
      <Text
        className={`text-xs ${selected ? 'text-primary' : 'text-text-secondary'}`}
      >
        {selected ? `${label} ✓` : label}
      </Text>
    </Pressable>
  );
}

/** Miniatura de una prenda elegida en la bandeja oscura "Tu outfit", con orden y quitar. */
function TrayItem({
  item,
  order,
  onRemove,
}: {
  item: ClothingItem;
  order: number;
  onRemove: () => void;
}) {
  const cover = item.imageUrls?.[0]
    ? resolveImageUrl(item.imageUrls[0])
    : undefined;
  return (
    <View className="relative w-14">
      <View className="aspect-[3/4] w-14 items-center justify-center overflow-hidden rounded-[10px] bg-[#0E3B49]">
        {cover ? (
          <Image
            source={{ uri: cover }}
            className="h-full w-full"
            resizeMode="cover"
          />
        ) : (
          <Text className="text-lg">{item.category?.icon ?? '👕'}</Text>
        )}
      </View>
      <View className="absolute -left-1.5 -top-1.5 h-5 w-5 items-center justify-center rounded-full bg-primary-soft">
        <Text className="text-[11px] font-bold text-primary">{order}</Text>
      </View>
      <Pressable
        testID="tray-remove"
        onPress={onRemove}
        hitSlop={10}
        accessibilityLabel={`Quitar ${item.name}`}
        className="absolute -right-1.5 -top-1.5 h-5 w-5 items-center justify-center rounded-full bg-secondary"
      >
        <Text className="text-[11px] text-text-inverse">✕</Text>
      </Pressable>
    </View>
  );
}

/** Prenda seleccionable en la grilla del armario (marca de orden si está en el outfit). */
function PickItem({
  item,
  index,
  onToggle,
}: {
  item: ClothingItem;
  index: number | null;
  onToggle: () => void;
}) {
  const cover = item.imageUrls?.[0]
    ? resolveImageUrl(item.imageUrls[0])
    : undefined;
  const selected = index !== null;
  return (
    <Pressable
      testID="outfit-pick-item"
      onPress={onToggle}
      className={`flex-1 overflow-hidden rounded-xl border ${
        selected ? 'border-2 border-primary' : 'border-[#EFE8E0]'
      }`}
    >
      <View className="aspect-[3/4] w-full items-center justify-center bg-surface-alt">
        {cover ? (
          <Image
            source={{ uri: cover }}
            className="h-full w-full"
            resizeMode="cover"
          />
        ) : (
          <Text className="text-3xl">{item.category?.icon ?? '👕'}</Text>
        )}
        {selected ? (
          <View className="absolute right-1.5 top-1.5 h-[22px] w-[22px] items-center justify-center rounded-full bg-primary">
            <Text className="text-xs font-bold text-text-inverse">
              {index + 1}
            </Text>
          </View>
        ) : null}
      </View>
    </Pressable>
  );
}

/**
 * Formulario compartido de outfit (crear y editar), calcado del diseño 10–12 (Armar outfit).
 * Vista presentacional: la lógica vive en `useOutfitForm` (`docs/CODING-CONVENTIONS.md §5`).
 * Layout: nombre + ocasiones arriba; luego la BANDEJA oscura "Tu outfit" (fija) con las prendas
 * elegidas; buscador + filtro de categoría; y la grilla 3-col del armario scrolleable.
 */
export function OutfitForm({
  submitLabel,
  onSubmit,
  defaultOutfit,
  submitting = false,
  title,
  onCancel,
  onGoToWardrobe,
}: OutfitFormProps) {
  const { state, data, actions, flags } = useOutfitForm({
    onSubmit,
    defaultOutfit,
  });

  const countLabel =
    flags.selectedCount < 2
      ? `${flags.selectedCount} elegidas · mínimo 2`
      : `${flags.selectedCount} elegidas`;

  const emptyWardrobe = data.clothes.length === 0 && !flags.isFiltering;
  const noResults = data.clothes.length === 0 && flags.isFiltering;

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      {/* Barra título */}
      <View className="flex-row items-center justify-between px-[22px] pb-3 pt-1.5">
        <Pressable onPress={onCancel} hitSlop={8}>
          <Text className="text-[15px] text-text-secondary">Cancelar</Text>
        </Pressable>
        <Text
          className="text-[22px] text-text-primary"
          style={{ fontFamily: fonts.serif }}
        >
          {title}
        </Text>
        <View className="w-[52px]" />
      </View>

      {/* Nombre + ocasiones (compacto, fijo) */}
      <View className="px-[22px] pb-3">
        <TextInput
          value={state.name}
          onChangeText={actions.setName}
          placeholder="Nombre del outfit…"
          placeholderTextColor={palette.text.muted}
          className="h-[46px] rounded-[13px] bg-surface-alt px-[15px] text-[15px] text-text-primary"
        />
        {data.occasionOptions.length > 0 ? (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerClassName="mt-2.5 gap-2 pr-5"
          >
            {data.occasionOptions.map((o: ChipOption) => (
              <OccasionChip
                key={o.id}
                label={o.label}
                selected={state.occasionIds.includes(o.id)}
                onPress={() => actions.toggleOccasion(o.id)}
              />
            ))}
          </ScrollView>
        ) : null}
      </View>

      {/* BANDEJA oscura "Tu outfit" (fija) */}
      <View className="bg-primary-dark px-4 pb-[15px] pt-[13px]">
        <View className="mb-2.5 flex-row items-center justify-between">
          <Text className="text-[11px] font-semibold uppercase tracking-[1px] text-[#9FBFC6]">
            Tu outfit
          </Text>
          <Text className="text-xs text-primary-soft">{countLabel}</Text>
        </View>

        {data.selectedItems.length > 0 ? (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerClassName="gap-2.5 py-1"
          >
            {data.selectedItems.map((item, idx) => (
              <TrayItem
                key={item.id}
                item={item}
                order={idx + 1}
                onRemove={() => actions.removeItem(item.id)}
              />
            ))}
            <View className="aspect-[3/4] w-14 items-center justify-center rounded-[10px] border-[1.5px] border-dashed border-[#37616E]">
              <Text className="text-2xl font-light text-[#6E9AA6]">+</Text>
            </View>
          </ScrollView>
        ) : (
          <View className="flex-row items-center gap-2.5">
            <View className="aspect-[3/4] w-14 rounded-[10px] border-[1.5px] border-dashed border-[#37616E]" />
            <View className="aspect-[3/4] w-14 rounded-[10px] border-[1.5px] border-dashed border-[#37616E]" />
            <Text className="flex-1 text-xs text-[#6E9AA6]">
              Elegí prendas de abajo para empezar
            </Text>
          </View>
        )}
      </View>

      {/* Buscador + filtro por categoría (oculto si el armario está totalmente vacío) */}
      {!emptyWardrobe ? (
        <View className="pt-3">
          <View className="px-5">
            <SearchBar
              value={state.search}
              onChangeText={actions.setSearch}
              placeholder="Buscar en tu armario…"
            />
          </View>
          <View className="pt-2.5">
            <FilterChips
              categories={data.categoryOptions}
              selectedId={state.categoryId}
              onSelect={actions.setCategoryId}
            />
          </View>
        </View>
      ) : null}

      {/* Grilla del armario / estados vacíos */}
      {flags.isLoadingClothes ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color={palette.primary.DEFAULT} />
        </View>
      ) : emptyWardrobe ? (
        <View className="flex-1 items-center justify-center px-11">
          <View
            testID="builder-hanger-illustration"
            className="h-[108px] w-[108px] items-center justify-center rounded-full bg-surface-alt"
          >
            <View className="relative h-[70px] w-[56px] rounded-b-[10px] rounded-t-md border-2 border-text-muted">
              <View className="absolute -top-[11px] left-1/2 h-[15px] w-[26px] -translate-x-1/2 rounded-t-xl border-2 border-b-0 border-text-muted" />
            </View>
          </View>
          <Text
            className="mt-[22px] text-center text-2xl leading-tight text-text-primary"
            style={{ fontFamily: fonts.serif }}
          >
            Tu armario está vacío
          </Text>
          <Text className="mt-2 text-center text-sm leading-relaxed text-text-secondary">
            Necesitás prendas para armar un outfit. Agregá algunas primero.
          </Text>
          <Pressable
            testID="builder-go-to-wardrobe"
            onPress={onGoToWardrobe ?? onCancel}
            className="mt-[22px] h-12 items-center justify-center rounded-[15px] bg-primary px-[22px]"
          >
            <Text className="text-sm font-medium text-text-inverse">
              Ir a mi armario
            </Text>
          </Pressable>
        </View>
      ) : noResults ? (
        <View className="flex-1 items-center justify-center px-11">
          <View className="h-24 w-24 items-center justify-center rounded-full bg-surface-alt">
            <Text className="text-4xl text-text-muted">⌕</Text>
          </View>
          <Text
            className="mt-5 text-center text-2xl leading-tight text-text-primary"
            style={{ fontFamily: fonts.serif }}
          >
            Sin resultados
          </Text>
          <Text className="mt-2 text-center text-sm leading-relaxed text-text-secondary">
            No encontramos prendas con esos filtros.
          </Text>
          <Pressable
            testID="builder-clear-filters"
            onPress={() => {
              actions.clearSearch();
              actions.setCategoryId(null);
            }}
            className="mt-5 h-11 items-center justify-center rounded-[14px] border border-border bg-surface px-5"
          >
            <Text className="text-sm font-medium text-text-primary">
              Limpiar filtros
            </Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={data.clothes}
          keyExtractor={(it) => it.id}
          numColumns={3}
          columnWrapperClassName="gap-2.5"
          contentContainerClassName="gap-2.5 px-5 pb-28 pt-1.5"
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
      <View className="absolute bottom-0 left-0 right-0 bg-background px-[22px] pb-8 pt-3">
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
