import { Text, View } from 'react-native';

import { Button } from '../../../shared/components/Button';
import { fonts } from '../../../theme';

interface OutfitsEmptyStateProps {
  onPressCreate: () => void;
}

/**
 * Estado vacío de outfits (diseño 08 · Mis outfits · vacío): ilustración de dos prendas en
 * un círculo, título serif de marca, subtítulo y CTA para armar el primer outfit.
 */
export function OutfitsEmptyState({ onPressCreate }: OutfitsEmptyStateProps) {
  return (
    <View className="flex-1 items-center justify-center px-11">
      <View
        testID="outfits-empty-illustration"
        className="h-[132px] w-[132px] flex-row items-center justify-center gap-1.5 rounded-full bg-primary-soft"
      >
        <View className="h-[46px] w-[34px] rounded-[5px] border-[1.5px] border-primary bg-surface" />
        <View className="mt-4 h-[46px] w-[34px] rounded-[5px] border-[1.5px] border-primary bg-surface" />
      </View>

      <Text
        className="mt-7 text-center text-[28px] leading-tight text-text-primary"
        style={{ fontFamily: fonts.serif }}
      >
        Todavía no armaste outfits
      </Text>
      <Text className="mt-2.5 text-center text-[15px] leading-relaxed text-text-secondary">
        Combiná prendas de tu armario y tené tus looks listos con antelación.
      </Text>

      <View className="mt-6 w-full">
        <Button label="Armar mi primer outfit" onPress={onPressCreate} />
      </View>
    </View>
  );
}
