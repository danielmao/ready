import { FlatList, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '../../../shared/components/Button';
import { EmptyState } from '../../../shared/components/EmptyState';
import type { MainTabScreenProps } from '../../../navigation/types';
import { fonts } from '../../../theme';
import { OutfitCard } from '../components/OutfitCard';
import { OutfitCardSkeleton } from '../components/OutfitCardSkeleton';
import { OutfitsEmptyState } from '../components/OutfitsEmptyState';
import { SearchBar } from '../../clothes/components/SearchBar';
import { useOutfitsListController } from '../hooks/useOutfitsListController';

/**
 * Pantalla 06 · Mis outfits. Lista de conjuntos, cada uno con su tira de miniaturas. Screen
 * presentacional: la lógica vive en `useOutfitsListController` (`docs/CODING-CONVENTIONS.md §5`).
 */
export function OutfitsListScreen({
  navigation,
}: MainTabScreenProps<'OutfitsTab'>) {
  const { state, data, actions, flags } = useOutfitsListController(navigation);

  const header = (
    <View className="px-6 pb-1 pt-3">
      <Text className="text-sm font-medium uppercase tracking-[3px] text-secondary">
        Ready
      </Text>
      <Text
        className="mt-1.5 text-[42px] leading-none text-text-primary"
        style={{ fontFamily: fonts.serif }}
      >
        Mis outfits
      </Text>
      <View className="mt-4">
        <SearchBar
          value={state.search}
          onChangeText={actions.setSearch}
          placeholder="Buscar un outfit…"
        />
      </View>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      {header}

      {flags.isLoading ? (
        <View testID="outfits-loading" className="gap-3.5 px-5 pt-1">
          <OutfitCardSkeleton thumbs={4} />
          <OutfitCardSkeleton thumbs={3} />
          <Text className="mt-1 text-center text-[13px] text-text-muted">
            Cargando tus outfits…
          </Text>
        </View>
      ) : flags.isError ? (
        <View className="flex-1">
          <EmptyState
            title="No pudimos cargar tus outfits"
            subtitle="Revisá que la API esté corriendo y volvé a intentar."
          />
          <View className="px-6 pb-8">
            <Button label="Reintentar" onPress={actions.refetch} />
          </View>
        </View>
      ) : flags.isEmpty ? (
        <OutfitsEmptyState onPressCreate={actions.goToCreate} />
      ) : (
        <FlatList
          data={data.items}
          keyExtractor={(o) => o.id}
          contentContainerClassName="gap-3.5 px-5 pb-28 pt-1"
          refreshing={flags.isRefetching}
          onRefresh={actions.refetch}
          renderItem={({ item }) => (
            <OutfitCard
              outfit={item}
              onPress={() => actions.goToDetail(item.id)}
            />
          )}
          ListEmptyComponent={
            <EmptyState
              title="Sin resultados"
              subtitle="Probá con otra búsqueda."
            />
          }
        />
      )}

      <Pressable
        testID="add-outfit-fab"
        onPress={actions.goToCreate}
        className="absolute bottom-6 right-6 h-[60px] w-[60px] items-center justify-center rounded-full bg-primary shadow-lg"
      >
        <Text className="text-3xl font-light text-text-inverse">+</Text>
      </Pressable>
    </SafeAreaView>
  );
}
