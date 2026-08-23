import { Image, Pressable, Text, View } from 'react-native';

import type { DayPlanView } from '../../../domain/models/planning';
import { resolveImageUrl } from '../../../shared/utils/resolveImageUrl';
import { dayOfMonth, shortWeekday } from '../../../shared/utils/week';

/** Lo que la tira necesita saber de un día. */
interface StripDay {
  key: string;
  plan: DayPlanView | null;
}

/**
 * Tira de los 7 días de la semana (lunes→domingo): el control principal del home. Cada día es
 * un botón que muestra si ya tiene outfit —con su miniatura— o si está libre. El seleccionado
 * se pinta en petróleo; hoy lleva un punto debajo.
 */
export function WeekStrip({
  days,
  selectedDay,
  today,
  onSelect,
}: {
  days: StripDay[];
  selectedDay: string;
  today: string;
  onSelect: (day: string) => void;
}) {
  return (
    <View className="flex-row gap-1.5 px-6">
      {days.map(({ key, plan }) => {
        const isSelected = key === selectedDay;
        const cover = plan?.items?.[0]?.clothingItem?.imageUrls?.[0];
        const isPlanned = Boolean(plan?.plannedOutfit);
        const isConfirmed = plan?.plannedOutfit?.status === 'confirmed';

        return (
          <Pressable
            key={key}
            testID={`week-day-${key}`}
            accessibilityRole="button"
            accessibilityState={{ selected: isSelected }}
            onPress={() => onSelect(key)}
            className={`flex-1 items-center rounded-2xl border px-0.5 pb-2 pt-2.5 ${
              isSelected
                ? 'border-primary bg-primary'
                : 'border-[#E4DCD3] bg-surface'
            }`}
          >
            <Text
              className={`text-[10px] uppercase tracking-wide ${
                isSelected ? 'text-text-inverse/70' : 'text-text-muted'
              }`}
            >
              {shortWeekday(key)}
            </Text>
            <Text
              className={`mt-0.5 text-[15px] font-semibold ${
                isSelected ? 'text-text-inverse' : 'text-text-primary'
              }`}
            >
              {dayOfMonth(key)}
            </Text>

            {/* Estado del día: miniatura del outfit, o un hueco punteado si está libre. */}
            <View
              className={`mt-1.5 h-8 w-8 items-center justify-center overflow-hidden rounded-lg ${
                isPlanned
                  ? 'bg-surface-alt'
                  : `border border-dashed ${isSelected ? 'border-text-inverse/40' : 'border-border'}`
              }`}
            >
              {cover ? (
                <Image
                  source={{ uri: resolveImageUrl(cover) }}
                  className="h-full w-full"
                  resizeMode="cover"
                />
              ) : isPlanned ? (
                <Text className="text-xs">👗</Text>
              ) : null}
            </View>

            {isConfirmed ? (
              <Text className="mt-1 text-[9px] leading-none text-success">✓</Text>
            ) : (
              <View className="mt-1 h-[9px]" />
            )}

            <View
              className={`mt-0.5 h-1 w-1 rounded-full ${
                key === today
                  ? isSelected
                    ? 'bg-text-inverse'
                    : 'bg-secondary'
                  : 'bg-transparent'
              }`}
            />
          </Pressable>
        );
      })}
    </View>
  );
}
