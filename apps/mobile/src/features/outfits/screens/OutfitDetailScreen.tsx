import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ConfirmDialog } from '../../../shared/components/ConfirmDialog';
import { EmptyState } from '../../../shared/components/EmptyState';
import type { OutfitClothingItem } from '../../../domain/models/outfit';
import type { RootStackScreenProps } from '../../../navigation/types';
import { colors, fonts } from '../../../theme';
import { resolveImageUrl } from '../../../shared/utils/resolveImageUrl';
import { useOutfitDetailController } from '../hooks/useOutfitDetailController';

/** Chip de solo lectura (ocasiones / tags). */
function ReadonlyChip({ label, filled }: { label: string; filled?: boolean }) {
  return (
    <Text
      className={`h-[34px] overflow-hidden rounded-[17px] px-[15px] py-2 text-[13px] ${
        filled
          ? 'bg-primary-soft text-primary'
          : 'border border-border text-text-secondary'
      }`}
    >
      {label}
    </Text>
  );
}

/** Miniatura de la tira superior (una por prenda del outfit). */
function HeroThumb({ item }: { item?: OutfitClothingItem }) {
  const cover = item?.imageUrls?.[0]
    ? resolveImageUrl(item.imageUrls[0])
    : undefined;
  return (
    <View className="aspect-[3/4] flex-1 overflow-hidden rounded-[14px] bg-surface-alt">
      {cover ? (
        <Image
          source={{ uri: cover }}
          className="h-full w-full"
          resizeMode="cover"
        />
      ) : null}
    </View>
  );
}

/**
 * Pantalla 09 · Detalle de outfit: hero de miniaturas, lista de prendas con su color, ocasiones
 * y tags, y barra de acción (Editar / papelera → archivar). Screen presentacional; la lógica
 * vive en `useOutfitDetailController`.
 */
export function OutfitDetailScreen({
  navigation,
  route,
}: RootStackScreenProps<'OutfitDetail'>) {
  const { id } = route.params;
  const { data, state, actions, flags } = useOutfitDetailController(
    id,
    navigation,
  );
  const { outfit } = data;

  if (flags.isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator color={colors.primary.DEFAULT} />
      </View>
    );
  }

  if (flags.isError || !outfit) {
    return (
      <View className="flex-1 bg-background">
        <EmptyState
          title="No pudimos cargar el outfit"
          subtitle="Volvé a la lista e intentá de nuevo."
        />
      </View>
    );
  }

  const items = outfit.items ?? [];
  const hero = items.slice(0, 4);

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <View className="flex-row items-center px-5 pb-1 pt-1.5">
        <Pressable
          testID="outfit-detail-back"
          onPress={actions.goBack}
          className="h-[42px] w-[42px] items-center justify-center rounded-full border border-[#E4DCD3] bg-surface"
        >
          <Text className="text-xl text-text-primary">‹</Text>
        </Pressable>
      </View>

      <ScrollView
        contentContainerClassName="px-6 pb-40"
        showsVerticalScrollIndicator={false}
      >
        <Text className="mt-1.5 text-xs uppercase tracking-wider text-text-secondary">
          Outfit
        </Text>
        <Text
          className="mt-1 text-[38px] leading-[1.05] text-text-primary"
          style={{ fontFamily: fonts.serif }}
        >
          {outfit.name}
        </Text>
        <Text className="mt-1.5 text-sm text-text-muted">
          {items.length} prendas
        </Text>

        {hero.length > 0 ? (
          <View className="mt-[18px] flex-row gap-[9px]">
            {hero.map((it) => (
              <HeroThumb key={it.id} item={it.clothingItem} />
            ))}
          </View>
        ) : null}

        <Text
          className="mb-3 mt-6 text-[22px] text-text-primary"
          style={{ fontFamily: fonts.serif }}
        >
          Prendas
        </Text>
        <View className="gap-2.5">
          {items.map((it) => {
            const ci = it.clothingItem;
            const cover = ci?.imageUrls?.[0]
              ? resolveImageUrl(ci.imageUrls[0])
              : undefined;
            return (
              <View
                key={it.id}
                className="flex-row items-center gap-3 rounded-2xl border border-[#EFE8E0] bg-surface p-2.5 pl-3"
              >
                <View className="h-[60px] w-[46px] items-center justify-center overflow-hidden rounded-[9px] bg-surface-alt">
                  {cover ? (
                    <Image
                      source={{ uri: cover }}
                      className="h-full w-full"
                      resizeMode="cover"
                    />
                  ) : null}
                </View>
                <View className="flex-1">
                  <Text
                    className="text-[15px] font-medium text-text-primary"
                    numberOfLines={1}
                  >
                    {ci?.name ?? 'Prenda'}
                  </Text>
                  {ci?.category ? (
                    <Text className="mt-0.5 text-xs text-text-muted">
                      {ci.category.name}
                    </Text>
                  ) : null}
                </View>
                {ci?.color ? (
                  <View
                    className="h-3.5 w-3.5 rounded-full border border-border"
                    style={{ backgroundColor: ci.color.hexCode }}
                  />
                ) : null}
              </View>
            );
          })}
        </View>

        {outfit.occasions && outfit.occasions.length > 0 ? (
          <View className="mt-6">
            <Text
              className="mb-3 text-[22px] text-text-primary"
              style={{ fontFamily: fonts.serif }}
            >
              Ocasiones
            </Text>
            <View className="flex-row flex-wrap gap-2.5">
              {outfit.occasions.map((o) => (
                <ReadonlyChip key={o.id} label={o.name} filled />
              ))}
            </View>
          </View>
        ) : null}

        {outfit.tags && outfit.tags.length > 0 ? (
          <View className="mt-6">
            <Text
              className="mb-3 text-[22px] text-text-primary"
              style={{ fontFamily: fonts.serif }}
            >
              Tags
            </Text>
            <View className="flex-row flex-wrap gap-2.5">
              {outfit.tags.map((t) => (
                <ReadonlyChip key={t.id} label={t.name} />
              ))}
            </View>
          </View>
        ) : null}
      </ScrollView>

      <View className="absolute bottom-0 left-0 right-0 flex-row gap-2.5 bg-background px-6 pb-8 pt-4">
        <Pressable
          onPress={actions.goToEdit}
          className="h-[54px] flex-1 items-center justify-center rounded-2xl bg-primary"
        >
          <Text className="text-base font-medium text-text-inverse">
            Editar
          </Text>
        </Pressable>
        <Pressable
          testID="outfit-archive"
          onPress={actions.askArchive}
          disabled={flags.archiving}
          className="h-[54px] w-[54px] items-center justify-center rounded-2xl border border-error"
        >
          <Text className="text-lg text-error">🗑</Text>
        </Pressable>
      </View>

      <ConfirmDialog
        visible={state.confirmArchive}
        title="¿Eliminar este outfit?"
        message="El outfit se archivará y dejará de aparecer en tu lista. Tus prendas no se ven afectadas."
        confirmLabel="Sí, eliminar"
        confirming={flags.archiving}
        onConfirm={actions.handleArchive}
        onCancel={actions.cancelArchive}
      />
    </SafeAreaView>
  );
}
