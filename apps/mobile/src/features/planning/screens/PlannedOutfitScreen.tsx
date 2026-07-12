import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '../../../shared/components/Button';
import { ConfirmDialog } from '../../../shared/components/ConfirmDialog';
import { EmptyState } from '../../../shared/components/EmptyState';
import type { OutfitClothingItem } from '../../../domain/models/outfit';
import type { MainTabScreenProps } from '../../../navigation/types';
import { colors, fonts } from '../../../theme';
import { resolveImageUrl } from '../../../shared/utils/resolveImageUrl';
import { usePlannedOutfitController } from '../hooks/usePlannedOutfitController';

/** Miniatura de la tira superior (una por prenda del outfit planeado). */
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
 * Pantalla · Planear (tab). Muestra el próximo outfit fijado con un checklist de prendas
 * (HU-04/05) y las acciones Confirmar / Cambiar / Quitar. Screen presentacional: la lógica vive
 * en `usePlannedOutfitController` (`docs/CODING-CONVENTIONS.md §5`).
 */
export function PlannedOutfitScreen({
  navigation,
}: MainTabScreenProps<'PlanearTab'>) {
  const { data, state, actions, flags } = usePlannedOutfitController(navigation);
  const { outfit, items } = data;

  const header = (
    <View className="px-6 pb-1 pt-3">
      <Text className="text-sm font-medium uppercase tracking-[3px] text-secondary">
        Ready
      </Text>
      <Text
        className="mt-1.5 text-[42px] leading-none text-text-primary"
        style={{ fontFamily: fonts.serif }}
      >
        Planear
      </Text>
    </View>
  );

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

  if (flags.isError) {
    return (
      <SafeAreaView className="flex-1 bg-background" edges={['top']}>
        {header}
        <EmptyState
          title="No pudimos cargar tu plan"
          subtitle="Revisá que la API esté corriendo y volvé a intentar."
        />
        <View className="px-6 pb-8">
          <Button label="Reintentar" onPress={actions.refetch} />
        </View>
      </SafeAreaView>
    );
  }

  if (flags.isEmpty || !outfit) {
    return (
      <SafeAreaView className="flex-1 bg-background" edges={['top']}>
        {header}
        <View className="flex-1 items-center justify-center px-11">
          <View className="h-[132px] w-[132px] items-center justify-center rounded-full bg-primary-soft">
            <Text className="text-5xl">🗓️</Text>
          </View>
          <Text
            className="mt-7 text-center text-[28px] leading-tight text-text-primary"
            style={{ fontFamily: fonts.serif }}
          >
            Nada planeado todavía
          </Text>
          <Text className="mt-2.5 text-center text-[15px] leading-relaxed text-text-secondary">
            Elegí uno de tus outfits y dejalo listo para tu próxima salida.
          </Text>
          <View className="mt-7 w-full">
            <Button label="Elegir mi próximo outfit" onPress={actions.goToPicker} />
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
        contentContainerClassName="px-6 pb-44"
        showsVerticalScrollIndicator={false}
      >
        <View className="mt-1 flex-row items-center justify-between">
          <Text className="text-xs uppercase tracking-wider text-text-secondary">
            {flags.isConfirmed ? 'Listo para salir' : 'Tu próximo outfit'}
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
            className="mt-1 text-[38px] leading-[1.05] text-text-primary"
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
        title="¿Quitar el planeado?"
        message="Dejarás de tener un próximo outfit fijado. Podés elegir otro cuando quieras."
        confirmLabel="Sí, quitar"
        confirming={flags.removing}
        onConfirm={actions.handleRemove}
        onCancel={actions.cancelRemove}
      />
    </SafeAreaView>
  );
}
