import { Image, Pressable, Text, View } from 'react-native';

import type { ClothingItem } from '../../../domain/models/clothing';
import { resolveImageUrl } from '../../../shared/utils/resolveImageUrl';

interface ClothingCardProps {
  item: ClothingItem;
  onPress: () => void;
}

/**
 * Tarjeta vertical de una prenda en el grid del armario (diseño lookbook):
 * foto 3/4 arriba, nombre, chip de categoría y dot de color abajo.
 */
export function ClothingCard({ item, onPress }: ClothingCardProps) {
  const cover = item.imageUrls?.[0]
    ? resolveImageUrl(item.imageUrls[0])
    : undefined;

  return (
    <Pressable
      testID="clothing-card"
      onPress={onPress}
      className="flex-1 overflow-hidden rounded-[20px] border border-surface-alt bg-surface"
    >
      <View className="aspect-[3/4] w-full items-center justify-center bg-surface-alt">
        {cover ? (
          <Image
            source={{ uri: cover }}
            className="h-full w-full"
            resizeMode="cover"
          />
        ) : (
          <Text testID="clothing-card-placeholder" className="text-4xl">
            {item.category?.icon ?? '👕'}
          </Text>
        )}
      </View>

      <View className="px-3 pb-3.5 pt-2.5">
        <Text
          className="text-sm font-medium leading-tight text-text-primary"
          numberOfLines={2}
        >
          {item.name}
        </Text>
        <View className="mt-2 flex-row items-center justify-between">
          {item.category ? (
            <Text className="rounded-[10px] bg-surface-alt px-2.5 py-0.5 text-[11px] text-text-secondary">
              {item.category.name}
            </Text>
          ) : (
            <View />
          )}
          {item.color ? (
            <View className="flex-row items-center gap-1.5">
              <View
                className="h-3 w-3 rounded-full border border-border"
                style={{ backgroundColor: item.color.hexCode }}
              />
              <Text className="text-[11px] text-text-muted" numberOfLines={1}>
                {item.color.name}
              </Text>
            </View>
          ) : null}
        </View>
      </View>
    </Pressable>
  );
}
