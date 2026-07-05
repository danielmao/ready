import { Image, Pressable, Text, View } from 'react-native';

import type { Outfit } from '../../../domain/models/outfit';
import { resolveImageUrl } from '../../../shared/utils/resolveImageUrl';

interface OutfitCardProps {
  outfit: Outfit;
  onPress: () => void;
}

/** Miniatura de una prenda del outfit (foto o ícono de categoría). */
function ItemThumb({ uri, icon }: { uri?: string; icon?: string }) {
  return (
    <View className="h-14 w-14 items-center justify-center overflow-hidden rounded-xl border border-border bg-surface-alt">
      {uri ? (
        <Image source={{ uri }} className="h-full w-full" resizeMode="cover" />
      ) : (
        <Text className="text-xl">{icon ?? '👕'}</Text>
      )}
    </View>
  );
}

/**
 * Tarjeta de un outfit en la lista: tira horizontal de miniaturas de sus prendas + nombre,
 * cantidad de prendas y chips de ocasiones.
 */
export function OutfitCard({ outfit, onPress }: OutfitCardProps) {
  const items = outfit.items ?? [];
  const preview = items.slice(0, 4);
  const extra = items.length - preview.length;

  return (
    <Pressable
      testID="outfit-card"
      onPress={onPress}
      className="mx-5 overflow-hidden rounded-[20px] border border-surface-alt bg-surface p-4"
    >
      <View className="flex-row items-center gap-2">
        {preview.map((it) => (
          <ItemThumb
            key={it.id}
            uri={
              it.clothingItem?.imageUrls?.[0]
                ? resolveImageUrl(it.clothingItem.imageUrls[0])
                : undefined
            }
          />
        ))}
        {extra > 0 ? (
          <View className="h-14 w-14 items-center justify-center rounded-xl bg-surface-alt">
            <Text className="text-sm text-text-secondary">+{extra}</Text>
          </View>
        ) : null}
      </View>

      <View className="mt-3 flex-row items-center justify-between">
        <Text
          className="flex-1 text-base font-medium text-text-primary"
          numberOfLines={1}
        >
          {outfit.name}
        </Text>
        <Text className="text-xs text-text-muted">{items.length} prendas</Text>
      </View>

      {outfit.occasions && outfit.occasions.length > 0 ? (
        <View className="mt-2 flex-row flex-wrap gap-1.5">
          {outfit.occasions.map((o) => (
            <Text
              key={o.id}
              className="rounded-full bg-primary-soft px-2.5 py-0.5 text-[11px] text-primary"
            >
              {o.name}
            </Text>
          ))}
        </View>
      ) : null}
    </Pressable>
  );
}
