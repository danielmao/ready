import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';

import { ConfirmDialog } from '../../../shared/components/ConfirmDialog';
import { EmptyState } from '../../../shared/components/EmptyState';
import type { RootStackScreenProps } from '../../../navigation/types';
import { colors, fonts } from '../../../theme';
import { resolveImageUrl } from '../../../shared/utils/resolveImageUrl';
import { useOutfitDetailController } from '../hooks/useOutfitDetailController';

/** Chip de solo lectura (ocasiones / tags). */
function ReadonlyChip({ label, filled }: { label: string; filled?: boolean }) {
  return (
    <Text
      className={`overflow-hidden rounded-full px-[15px] py-2 text-[13px] ${
        filled ? 'bg-primary-soft text-primary' : 'border border-border text-text-secondary'
      }`}
    >
      {label}
    </Text>
  );
}

/**
 * Pantalla · Detalle de outfit: prendas que lo componen, ocasiones/tags y acciones (editar,
 * archivar). Screen presentacional; la lógica vive en `useOutfitDetailController`.
 */
export function OutfitDetailScreen({
  navigation,
  route,
}: RootStackScreenProps<'OutfitDetail'>) {
  const { id } = route.params;
  const { data, state, actions, flags } = useOutfitDetailController(id, navigation);
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

  return (
    <View className="flex-1 bg-background">
      <ScrollView contentContainerClassName="pb-40" showsVerticalScrollIndicator={false}>
        <View className="flex-row items-center justify-between px-5 pb-2 pt-14">
          <Pressable
            testID="outfit-detail-back"
            onPress={actions.goBack}
            className="h-[42px] w-[42px] items-center justify-center rounded-full bg-surface"
          >
            <Text className="text-xl text-text-primary">‹</Text>
          </Pressable>
        </View>

        <View className="px-6">
          <Text
            className="mt-2 text-4xl leading-tight text-text-primary"
            style={{ fontFamily: fonts.serif }}
          >
            {outfit.name}
          </Text>
          <Text className="mt-1 text-sm text-text-muted">{items.length} prendas</Text>

          <View className="mt-5 gap-3">
            {items.map((it) => {
              const ci = it.clothingItem;
              const cover = ci?.imageUrls?.[0]
                ? resolveImageUrl(ci.imageUrls[0])
                : undefined;
              return (
                <View
                  key={it.id}
                  className="flex-row items-center gap-3 rounded-2xl border border-surface-alt bg-surface p-3"
                >
                  <View className="h-16 w-16 items-center justify-center overflow-hidden rounded-xl bg-surface-alt">
                    {cover ? (
                      <Image source={{ uri: cover }} className="h-full w-full" resizeMode="cover" />
                    ) : (
                      <Text className="text-2xl">👕</Text>
                    )}
                  </View>
                  <View className="flex-1">
                    <Text className="text-[15px] text-text-primary" numberOfLines={1}>
                      {ci?.name ?? 'Prenda'}
                    </Text>
                    {ci?.category ? (
                      <Text className="mt-0.5 text-xs text-text-muted">
                        {ci.category.name}
                      </Text>
                    ) : null}
                  </View>
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
        </View>
      </ScrollView>

      <View className="absolute bottom-0 left-0 right-0 flex-row gap-2.5 bg-background px-6 pb-8 pt-4">
        <Pressable
          onPress={actions.goToEdit}
          className="h-[50px] flex-1 items-center justify-center rounded-2xl border border-border bg-surface"
        >
          <Text className="text-[15px] font-medium text-text-primary">Editar</Text>
        </Pressable>
        <Pressable
          testID="outfit-archive"
          onPress={actions.askArchive}
          disabled={flags.archiving}
          className="h-[50px] flex-1 items-center justify-center rounded-2xl border border-error"
        >
          <Text className="text-[15px] font-medium text-error">Eliminar</Text>
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
    </View>
  );
}
