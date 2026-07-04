import { Text, View } from 'react-native';

import { Button } from '../../../shared/components/Button';
import { fonts } from '../../../theme';

interface WardrobeEmptyStateProps {
  onPressAdd: () => void;
}

/**
 * Estado vacío del armario (pantalla 01b del diseño): ilustración de percha,
 * título serif de marca, subtítulo y CTA para agregar la primera prenda.
 */
export function WardrobeEmptyState({ onPressAdd }: WardrobeEmptyStateProps) {
  return (
    <View className="flex-1 items-center justify-center px-11">
      {/* Ilustración: percha dibujada con Views (sin assets externos). */}
      <View
        testID="hanger-illustration"
        className="h-[132px] w-[132px] items-center justify-center rounded-full bg-secondary-soft"
      >
        <View className="relative h-[92px] w-[74px] rounded-b-[10px] rounded-t-md border-2 border-secondary">
          <View className="absolute -top-3.5 left-1/2 h-5 w-9 -translate-x-1/2 rounded-t-2xl border-2 border-b-0 border-secondary" />
        </View>
      </View>

      <Text
        className="mt-7 text-center text-[28px] leading-tight text-text-primary"
        style={{ fontFamily: fonts.serif }}
      >
        Tu armario está vacío
      </Text>
      <Text className="mt-2.5 text-center text-[15px] leading-relaxed text-text-secondary">
        Empezá a construir tu colección para armar outfits con antelación.
      </Text>

      <View className="mt-6 w-full">
        <Button label="Agregá tu primera prenda" onPress={onPressAdd} />
      </View>
    </View>
  );
}
