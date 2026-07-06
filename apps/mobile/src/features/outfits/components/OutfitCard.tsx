import { Image, Pressable, Text, View } from 'react-native';

import type { Outfit } from '../../../domain/models/outfit';
import { fonts } from '../../../theme';
import { resolveImageUrl } from '../../../shared/utils/resolveImageUrl';

interface OutfitCardProps {
  outfit: Outfit;
  onPress: () => void;
}

/** Miniatura vertical (3/4) de una prenda del outfit dentro de la tira de la tarjeta. */
function StripThumb({ uri, label }: { uri?: string; label?: string }) {
  return (
    <View className="aspect-[3/4] flex-1 items-center justify-center overflow-hidden rounded-[11px] bg-surface-alt">
      {uri ? (
        <Image source={{ uri }} className="h-full w-full" resizeMode="cover" />
      ) : label ? (
        <Text className="text-sm text-text-secondary">{label}</Text>
      ) : null}
    </View>
  );
}

/**
 * Tarjeta de un outfit en la lista (diseño 06 · Mis outfits): tira de miniaturas verticales de
 * sus prendas (una por prenda), nombre serif, cantidad de prendas y chips de ocasiones.
 */
export function OutfitCard({ outfit, onPress }: OutfitCardProps) {
  const items = outfit.items ?? [];
  // Hasta 5 miniaturas a lo ancho; si hay más, la última muestra "+N".
  const max = 5;
  const preview = items.length > max ? items.slice(0, max - 1) : items;
  const extra = items.length - preview.length;

  return (
    <Pressable
      testID="outfit-card"
      onPress={onPress}
      className="rounded-[20px] border border-[#EFE8E0] bg-surface p-3.5"
    >
      <View className="flex-row gap-2">
        {preview.map((it) => (
          <StripThumb
            key={it.id}
            uri={
              it.clothingItem?.imageUrls?.[0]
                ? resolveImageUrl(it.clothingItem.imageUrls[0])
                : undefined
            }
          />
        ))}
        {extra > 0 ? <StripThumb label={`+${extra}`} /> : null}
      </View>

      <Text
        className="mt-3 text-2xl leading-none text-text-primary"
        style={{ fontFamily: fonts.serif }}
        numberOfLines={1}
      >
        {outfit.name}
      </Text>

      <View className="mt-2.5 flex-row items-center justify-between">
        <Text className="text-[13px] text-text-muted">
          {items.length} prendas
        </Text>
        {outfit.occasions && outfit.occasions.length > 0 ? (
          <View className="flex-row justify-end gap-1.5">
            {outfit.occasions.slice(0, 2).map((o) => (
              <View
                key={o.id}
                className="h-[26px] justify-center rounded-[13px] bg-primary-soft px-[11px]"
              >
                <Text className="text-xs text-primary" numberOfLines={1}>
                  {o.name}
                </Text>
              </View>
            ))}
          </View>
        ) : null}
      </View>
    </Pressable>
  );
}
