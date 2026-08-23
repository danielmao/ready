import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { OutfitClothingItem } from '../../../domain/models/outfit';
import type { MainTabScreenProps } from '../../../navigation/types';
import { Button } from '../../../shared/components/Button';
import { ConfirmDialog } from '../../../shared/components/ConfirmDialog';
import { EmptyState } from '../../../shared/components/EmptyState';
import { resolveImageUrl } from '../../../shared/utils/resolveImageUrl';
import { formatWeekRange, longWeekday } from '../../../shared/utils/week';
import { colors, fonts } from '../../../theme';
import { WeekStrip } from '../components/WeekStrip';
import { useWeekPlanController } from '../hooks/useWeekPlanController';

/** Miniatura de la tira superior (una por prenda del outfit del día). */
function HeroThumb({ item }: { item?: OutfitClothingItem }) {
  const cover = item?.imageUrls?.[0]
    ? resolveImageUrl(item.imageUrls[0])
    : undefined;
  return (
    <View className="aspect-[3/4] flex-1 overflow-hidden rounded-[14px] bg-surface-alt">
      {cover ? (
        <Image
          source={{ uri: cover }}
          className="h-full w-full"
          resizeMode="cover"
        />
      ) : null}
    </View>
  );
}

/**
 * Pantalla · **Home** (tab inicial). Muestra la semana completa: se elige un día en la tira
 * superior y debajo se ve —o se arma— el outfit de ese día, con su checklist de prendas
 * (HU-04/05). Screen presentacional: la lógica vive en `useWeekPlanController`
 * (`docs/CODING-CONVENTIONS.md §5`).
 */
export function WeekPlanScreen({ navigation }: MainTabScreenProps<'HomeTab'>) {
  const { data, state, actions, flags } = useWeekPlanController(navigation);
  const { selected, selectedDay } = data;
  const outfit = selected?.outfit ?? null;
  const items = selected?.items ?? [];

  const header = (
    <>
      <View className="px-6 pb-3 pt-3">
        <Text className="text-sm font-medium uppercase tracking-[3px] text-secondary">
          Ready
        </Text>
        <Text
          className="mt-1.5 text-[42px] leading-none text-text-primary"
          style={{ fontFamily: fonts.serif }}
        >
          Mi semana
        </Text>
      </View>

      <View className="flex-row items-center justify-between px-6 pb-3">
        <Pressable
          testID="week-prev"
          onPress={actions.prevWeek}
          className="h-9 w-9 items-center justify-center rounded-full border border-[#E4DCD3] bg-surface"
        >
          <Text className="text-base text-text-primary">‹</Text>
        </Pressable>

        <Pressable onPress={actions.goToday} disabled={flags.isCurrentWeek}>
          <Text className="text-[15px] font-medium text-text-primary">
            {formatWeekRange(data.weekStart, data.weekEnd)}
          </Text>
          <Text className="mt-0.5 text-center text-[11px] text-text-muted">
            {flags.isCurrentWeek
              ? `${flags.plannedCount} de 7 días listos`
              : 'Volver a esta semana'}
          </Text>
        </Pressable>

        <Pressable
          testID="week-next"
          onPress={actions.nextWeek}
          className="h-9 w-9 items-center justify-center rounded-full border border-[#E4DCD3] bg-surface"
        >
          <Text className="text-base text-text-primary">›</Text>
        </Pressable>
      </View>

      <WeekStrip
        days={data.dayKeys.map((key) => ({
          key,
          plan: data.days.find((day) => day.date === key) ?? null,
        }))}
        selectedDay={selectedDay}
        today={data.today}
        onSelect={actions.selectDay}
      />
    </>
  );

  if (flags.isError) {
    return (
      <SafeAreaView className="flex-1 bg-background" edges={['top']}>
        {header}
        <EmptyState
          title="No pudimos cargar tu semana"
          subtitle="Revisá que la API esté corriendo y volvé a intentar."
        />
        <View className="px-6 pb-8">
          <Button label="Reintentar" onPress={actions.refetch} />
        </View>
      </SafeAreaView>
    );
  }

  if (flags.isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-background" edges={['top']}>
        {header}
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color={colors.primary.DEFAULT} />
        </View>
      </SafeAreaView>
    );
  }

  const dayTitle = longWeekday(selectedDay);

  // Día libre (o con el outfit archivado): sólo se ofrece elegir.
  if (flags.isFree || !outfit) {
    return (
      <SafeAreaView className="flex-1 bg-background" edges={['top']}>
        {header}
        <View className="flex-1 items-center justify-center px-11">
          <View className="h-[112px] w-[112px] items-center justify-center rounded-full bg-primary-soft">
            <Text className="text-5xl">{flags.isOrphan ? '🕳️' : '🗓️'}</Text>
          </View>
          <Text
            className="mt-6 text-center text-[26px] leading-tight text-text-primary"
            style={{ fontFamily: fonts.serif }}
          >
            {flags.isOrphan
              ? `El outfit del ${dayTitle.toLowerCase()} ya no está`
              : `${dayTitle} está libre`}
          </Text>
          <Text className="mt-2 text-center text-[15px] leading-relaxed text-text-secondary">
            {flags.isOrphan
              ? 'Lo archivaste desde Outfits. Elegí otro para este día.'
              : 'Elegí uno de tus outfits y dejalo listo para ese día.'}
          </Text>
          <View className="mt-6 w-full">
            <Button label="Elegir outfit" onPress={actions.goToPicker} />
          </View>
        </View>
      </SafeAreaView>
    );
  }

  const hero = items.slice(0, 4);

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      {header}

      <ScrollView
        contentContainerClassName="px-6 pb-44 pt-4"
        showsVerticalScrollIndicator={false}
      >
        <View className="flex-row items-center justify-between">
          <Text className="text-xs uppercase tracking-wider text-text-secondary">
            {flags.isConfirmed ? `${dayTitle} · listo` : dayTitle}
          </Text>
          {flags.isConfirmed ? (
            <View className="rounded-full bg-success/15 px-3 py-1">
              <Text className="text-xs font-medium text-success">
                Confirmado ✓
              </Text>
            </View>
          ) : null}
        </View>

        <Pressable onPress={() => actions.goToDetail(outfit.id)}>
          <Text
            className="mt-1 text-[34px] leading-[1.05] text-text-primary"
            style={{ fontFamily: fonts.serif }}
          >
            {outfit.name}
          </Text>
        </Pressable>
        <Text className="mt-1.5 text-sm text-text-muted">
          {items.length} prendas
        </Text>

        {hero.length > 0 ? (
          <View className="mt-[18px] flex-row gap-[9px]">
            {hero.map((it) => (
              <HeroThumb key={it.id} item={it.clothingItem} />
            ))}
          </View>
        ) : null}

        <Text
          className="mb-3 mt-6 text-[22px] text-text-primary"
          style={{ fontFamily: fonts.serif }}
        >
          Checklist
        </Text>
        <View className="gap-2.5">
          {items.map((it) => {
            const ci = it.clothingItem;
            const cover = ci?.imageUrls?.[0]
              ? resolveImageUrl(ci.imageUrls[0])
              : undefined;
            return (
              <View
                key={it.id}
                className="flex-row items-center gap-3 rounded-2xl border border-[#EFE8E0] bg-surface p-2.5 pl-3"
              >
                <View className="h-[60px] w-[46px] items-center justify-center overflow-hidden rounded-[9px] bg-surface-alt">
                  {cover ? (
                    <Image
                      source={{ uri: cover }}
                      className="h-full w-full"
                      resizeMode="cover"
                    />
                  ) : null}
                </View>
                <View className="flex-1">
                  <Text
                    className="text-[15px] font-medium text-text-primary"
                    numberOfLines={1}
                  >
                    {ci?.name ?? 'Prenda'}
                  </Text>
                  {ci?.category ? (
                    <Text className="mt-0.5 text-xs text-text-muted">
                      {ci.category.name}
                    </Text>
                  ) : null}
                </View>
                <Text className="text-lg text-primary">○</Text>
              </View>
            );
          })}
        </View>
      </ScrollView>

      <View className="absolute bottom-0 left-0 right-0 bg-background px-6 pb-8 pt-4">
        {!flags.isConfirmed ? (
          <Pressable
            testID="planning-confirm"
            onPress={actions.confirm}
            disabled={flags.confirming}
            className={`mb-2.5 h-[54px] items-center justify-center rounded-2xl bg-primary ${
              flags.confirming ? 'opacity-60' : ''
            }`}
          >
            {flags.confirming ? (
              <ActivityIndicator color={colors.text.inverse} />
            ) : (
              <Text className="text-base font-medium text-text-inverse">
                Confirmar outfit
              </Text>
            )}
          </Pressable>
        ) : null}
        <View className="flex-row gap-2.5">
          <Pressable
            testID="planning-change"
            onPress={actions.goToPicker}
            className="h-[54px] flex-1 items-center justify-center rounded-2xl border border-border bg-surface"
          >
            <Text className="text-base font-medium text-text-primary">
              Cambiar outfit
            </Text>
          </Pressable>
          <Pressable
            testID="planning-remove"
            onPress={actions.askRemove}
            disabled={flags.removing}
            className="h-[54px] w-[54px] items-center justify-center rounded-2xl border border-error"
          >
            <Text className="text-lg text-error">🗑</Text>
          </Pressable>
        </View>
      </View>

      <ConfirmDialog
        visible={state.confirmRemove}
        icon="🗓️"
        title={`¿Liberar el ${dayTitle.toLowerCase()}?`}
        message="Ese día queda sin outfit. El resto de la semana no se toca."
        confirmLabel="Sí, liberar"
        confirming={flags.removing}
        onConfirm={actions.handleRemove}
        onCancel={actions.cancelRemove}
      />
    </SafeAreaView>
  );
}
