import { View } from 'react-native';

/**
 * Placeholder de carga de una tarjeta de outfit (diseño 07 · Mis outfits · cargando):
 * tira de miniaturas grises + barras de título/subtítulo. Sin animación (MVP).
 */
export function OutfitCardSkeleton({ thumbs = 4 }: { thumbs?: number }) {
  return (
    <View className="rounded-[20px] border border-[#EFE8E0] bg-surface p-3.5">
      <View className="flex-row gap-2">
        {Array.from({ length: thumbs }).map((_, i) => (
          <View
            key={i}
            className="aspect-[3/4] flex-1 rounded-[11px] bg-[#ECE5DC]"
          />
        ))}
      </View>
      <View className="mt-3.5 h-[22px] w-[150px] rounded-lg bg-[#ECE5DC]" />
      <View className="mt-2.5 h-3.5 w-20 rounded-[7px] bg-surface-alt" />
    </View>
  );
}
