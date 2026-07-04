import { Image, Text, View } from 'react-native';

import type { ClothingItem } from '../../../domain/models/clothing';
import { resolveImageUrl } from '../../../shared/utils/resolveImageUrl';

/** Tarjeta de una prenda en el listado del armario. */
export function ClothingCard({ item }: { item: ClothingItem }) {
  const cover = item.imageUrls?.[0]
    ? resolveImageUrl(item.imageUrls[0])
    : undefined;
  return (
    <View className="mb-3 flex-row items-center rounded-2xl bg-surface p-3 shadow-sm">
      <View className="h-16 w-16 items-center justify-center overflow-hidden rounded-xl bg-surface-alt">
        {cover ? (
          <Image source={{ uri: cover }} className="h-16 w-16" resizeMode="cover" />
        ) : (
          <Text className="text-2xl">{item.category?.icon ?? '👕'}</Text>
        )}
      </View>

      <View className="ml-3 flex-1">
        <Text
          className="text-base font-semibold text-text-primary"
          numberOfLines={1}
        >
          {item.name}
        </Text>
        <Text className="mt-0.5 text-sm text-text-secondary">
          {item.category?.name ?? 'Sin categoría'}
          {item.color ? ` · ${item.color.name}` : ''}
        </Text>
        {item.occasions && item.occasions.length > 0 ? (
          <Text className="mt-0.5 text-xs text-text-secondary" numberOfLines={1}>
            {item.occasions.map((o) => o.name).join(', ')}
          </Text>
        ) : null}
      </View>

      {item.color ? (
        <View
          className="ml-2 h-5 w-5 rounded-full border border-border"
          style={{ backgroundColor: item.color.hexCode }}
        />
      ) : null}
    </View>
  );
}
