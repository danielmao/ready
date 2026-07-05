import { useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '../../../shared/components/Button';
import { EmptyState } from '../../../shared/components/EmptyState';
import type { MainTabScreenProps } from '../../../navigation/types';
import { colors, fonts } from '../../../theme';
import { ClothingCard } from '../components/ClothingCard';
import { FilterChips } from '../components/FilterChips';
import { SearchBar } from '../components/SearchBar';
import { WardrobeEmptyState } from '../components/WardrobeEmptyState';
import { useCategories } from '../hooks/useCatalogs';
import { useClothes } from '../hooks/useClothes';

/**
 * Pantalla 01 · Mi armario. Grid tipo lookbook (2 columnas) con header de marca,
 * buscador y chips de filtro por categoría. Screen delgada: orquesta hooks + UI.
 */
export function ClothesListScreen({
  navigation,
}: MainTabScreenProps<'ArmarioTab'>) {
  const [search, setSearch] = useState('');
  const [categoryId, setCategoryId] = useState<string | null>(null);

  const { data: categories } = useCategories();
  const { data, isLoading, isError, refetch, isRefetching } = useClothes({
    search: search.trim() || undefined,
    categoryId: categoryId ?? undefined,
  });

  const items = data?.data ?? [];
  const isFiltering = search.trim().length > 0 || categoryId !== null;

  const header = (
    <View>
      <View className="px-6 pb-1 pt-3">
        <Text className="text-sm font-medium uppercase tracking-[3px] text-secondary">
          Ready
        </Text>
        <Text
          className="mt-1.5 text-[42px] leading-none text-text-primary"
          style={{ fontFamily: fonts.serif }}
        >
          Mi armario
        </Text>
        <View className="mt-4">
          <SearchBar value={search} onChangeText={setSearch} />
        </View>
      </View>
      <View className="pt-4">
        <FilterChips
          categories={categories ?? []}
          selectedId={categoryId}
          onSelect={setCategoryId}
        />
      </View>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      {header}

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color={colors.primary.DEFAULT} />
        </View>
      ) : isError ? (
        <View className="flex-1">
          <EmptyState
            title="No pudimos cargar tu armario"
            subtitle="Revisá que la API esté corriendo y volvé a intentar."
          />
          <View className="px-6 pb-8">
            <Button label="Reintentar" onPress={() => void refetch()} />
          </View>
        </View>
      ) : items.length === 0 && !isFiltering ? (
        <WardrobeEmptyState
          onPressAdd={() => navigation.navigate('AddClothingItem')}
        />
      ) : (
        <FlatList
          data={items}
          keyExtractor={(it) => it.id}
          numColumns={2}
          columnWrapperClassName="gap-4 px-5"
          contentContainerClassName="gap-4 pb-28 pt-1"
          refreshing={isRefetching}
          onRefresh={() => void refetch()}
          renderItem={({ item }) => (
            <ClothingCard
              item={item}
              onPress={() =>
                navigation.navigate('ClothingDetail', { id: item.id })
              }
            />
          )}
          ListEmptyComponent={
            <EmptyState
              title="Sin resultados"
              subtitle="Probá con otra búsqueda o quitá los filtros."
            />
          }
        />
      )}

      <Pressable
        testID="add-clothing-fab"
        onPress={() => navigation.navigate('AddClothingItem')}
        className="absolute bottom-9 right-6 h-[60px] w-[60px] items-center justify-center rounded-full bg-primary shadow-lg"
      >
        <Text className="text-3xl font-light text-text-inverse">+</Text>
      </Pressable>
    </SafeAreaView>
  );
}
