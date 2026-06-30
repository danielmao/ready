import { Image, Text, View } from 'react-native';

import type { ClothingItem } from '../../../domain/models/clothing';

/** Tarjeta de una prenda en el listado del armario. */
export function ClothingCard({ item }: { item: ClothingItem }) {
  const cover = item.imageUrls?.[0];
  return (
    <View className="mb-3 flex-row items-center rounded-2xl bg-white p-3 shadow-sm">
      <View className="h-16 w-16 items-center justify-center overflow-hidden rounded-xl bg-surface">
        {cover ? (
          <Image source={{ uri: cover }} className="h-16 w-16" resizeMode="cover" />
        ) : (
          <Text className="text-2xl">{item.category?.icon ?? '👕'}</Text>
        )}
      </View>

      <View className="ml-3 flex-1">
        <Text className="text-base font-semibold text-ink" numberOfLines={1}>
          {item.name}
        </Text>
        <Text className="mt-0.5 text-sm text-muted">
          {item.category?.name ?? 'Sin categoría'}
          {item.color ? ` · ${item.color.name}` : ''}
        </Text>
        {item.occasions && item.occasions.length > 0 ? (
          <Text className="mt-0.5 text-xs text-muted" numberOfLines={1}>
            {item.occasions.map((o) => o.name).join(', ')}
          </Text>
        ) : null}
      </View>

      {item.color ? (
        <View
          className="ml-2 h-5 w-5 rounded-full border border-slate-200"
          style={{ backgroundColor: item.color.hexCode }}
        />
      ) : null}
    </View>
  );
}
