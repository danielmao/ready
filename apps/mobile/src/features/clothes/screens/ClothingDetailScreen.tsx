import { useState } from 'react';
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
import {
  useArchiveClothingItem,
  useClothingItem,
} from '../hooks/useClothes';

/** Chip de solo lectura (ocasiones / tags) del detalle. */
function ReadonlyChip({ label, filled }: { label: string; filled?: boolean }) {
  return (
    <Text
      className={`overflow-hidden rounded-full px-[15px] py-2 text-[13px] ${
        filled
          ? 'bg-primary-soft text-primary'
          : 'border border-border text-text-secondary'
      }`}
    >
      {label}
    </Text>
  );
}

/**
 * Pantalla 02 · Detalle de prenda. Foto full-bleed con back/favorito, ficha con
 * color, descripción, ocasiones y tags, y barra de acción.
 */
export function ClothingDetailScreen({
  navigation,
  route,
}: RootStackScreenProps<'ClothingDetail'>) {
  const { id } = route.params;
  const { data: item, isLoading, isError } = useClothingItem(id);
  const archive = useArchiveClothingItem();
  const [confirmArchive, setConfirmArchive] = useState(false);

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator color={colors.primary.DEFAULT} />
      </View>
    );
  }

  if (isError || !item) {
    return (
      <View className="flex-1 bg-background">
        <EmptyState
          title="No pudimos cargar la prenda"
          subtitle="Volvé al armario e intentá de nuevo."
        />
      </View>
    );
  }

  const cover = item.imageUrls?.[0]
    ? resolveImageUrl(item.imageUrls[0])
    : undefined;

  const handleArchive = () => {
    archive.mutate(item.id);
    setConfirmArchive(false);
    navigation.goBack();
  };

  return (
    <View className="flex-1 bg-background">
      <ScrollView contentContainerClassName="pb-40" showsVerticalScrollIndicator={false}>
        {/* Foto full-bleed */}
        <View className="h-[420px] w-full items-center justify-center bg-surface-alt">
          {cover ? (
            <Image source={{ uri: cover }} className="h-full w-full" resizeMode="cover" />
          ) : (
            <Text className="text-6xl">{item.category?.icon ?? '👕'}</Text>
          )}
          <Pressable
            testID="detail-back"
            onPress={() => navigation.goBack()}
            className="absolute left-5 top-14 h-[42px] w-[42px] items-center justify-center rounded-full bg-surface/90"
          >
            <Text className="text-xl text-text-primary">‹</Text>
          </Pressable>
          <Pressable
            testID="detail-favorite"
            className="absolute right-5 top-14 h-[42px] w-[42px] items-center justify-center rounded-full bg-surface/90"
          >
            <Text className="text-lg text-secondary">♥</Text>
          </Pressable>
        </View>

        {/* Ficha */}
        <View className="-mt-7 rounded-t-[28px] bg-background px-6 pt-6">
          {item.category ? (
            <Text className="self-start overflow-hidden rounded-[11px] bg-surface-alt px-2.5 py-1 text-xs text-text-secondary">
              {item.category.name}
            </Text>
          ) : null}

          <Text
            className="mt-3 text-4xl leading-tight text-text-primary"
            style={{ fontFamily: fonts.serif }}
          >
            {item.name}
          </Text>

          {item.color ? (
            <View className="mt-4 flex-row items-center gap-2.5 border-b border-border pb-4">
              <Text className="w-[52px] text-[13px] text-text-muted">Color</Text>
              <View
                className="h-[18px] w-[18px] rounded-full border border-border"
                style={{ backgroundColor: item.color.hexCode }}
              />
              <Text className="text-sm text-text-primary">{item.color.name}</Text>
            </View>
          ) : null}

          {item.description ? (
            <Text className="mt-4 text-sm leading-relaxed text-text-secondary">
              {item.description}
            </Text>
          ) : null}

          {item.occasions && item.occasions.length > 0 ? (
            <View className="mt-6">
              <Text
                className="mb-3 text-[22px] text-text-primary"
                style={{ fontFamily: fonts.serif }}
              >
                Ocasiones
              </Text>
              <View className="flex-row flex-wrap gap-2.5">
                {item.occasions.map((o) => (
                  <ReadonlyChip key={o.id} label={o.name} filled />
                ))}
              </View>
            </View>
          ) : null}

          {item.tags && item.tags.length > 0 ? (
            <View className="mt-6">
              <Text
                className="mb-3 text-[22px] text-text-primary"
                style={{ fontFamily: fonts.serif }}
              >
                Tags
              </Text>
              <View className="flex-row flex-wrap gap-2.5">
                {item.tags.map((t) => (
                  <ReadonlyChip key={t.id} label={t.name} />
                ))}
              </View>
            </View>
          ) : null}
        </View>
      </ScrollView>

      {/* Barra de acción */}
      <View className="absolute bottom-0 left-0 right-0 gap-2.5 bg-background px-6 pb-8 pt-4">
        <Pressable
          onPress={() => {
            // TODO(outfits): navegar al armado de outfit con esta prenda (Épica outfits).
          }}
          className="h-[54px] items-center justify-center rounded-2xl bg-primary"
        >
          <Text className="text-base font-medium text-text-inverse">
            Usar en un outfit
          </Text>
        </Pressable>
        <View className="flex-row gap-2.5">
          <Pressable
            onPress={() =>
              navigation.navigate('EditClothingItem', { id: item.id })
            }
            className="h-[50px] flex-1 items-center justify-center rounded-2xl border border-border bg-surface"
          >
            <Text className="text-[15px] font-medium text-text-primary">Editar</Text>
          </Pressable>
          <Pressable
            onPress={() => setConfirmArchive(true)}
            disabled={archive.isPending}
            className="h-[50px] flex-1 items-center justify-center rounded-2xl border border-error"
          >
            <Text className="text-[15px] font-medium text-error">Archivar</Text>
          </Pressable>
        </View>
      </View>

      <ConfirmDialog
        visible={confirmArchive}
        title="¿Archivar esta prenda?"
        message="¿Estás seguro que deseás archivar esta prenda? Podrás recuperarla desde tu archivo cuando quieras."
        confirmLabel="Sí, archivar"
        confirming={archive.isPending}
        onConfirm={handleArchive}
        onCancel={() => setConfirmArchive(false)}
      />
    </View>
  );
}
