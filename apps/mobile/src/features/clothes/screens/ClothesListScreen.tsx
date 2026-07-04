import { ActivityIndicator, FlatList, Text, View } from 'react-native';

import { colors } from '../../../theme';
import { Button } from '../../../shared/components/Button';
import { EmptyState } from '../../../shared/components/EmptyState';
import type { RootStackScreenProps } from '../../../navigation/types';
import { ClothingCard } from '../components/ClothingCard';
import { useClothes } from '../hooks/useClothes';

/** Lista de prendas del armario. Screen delgada: sólo orquesta hook + UI. */
export function ClothesListScreen({
  navigation,
}: RootStackScreenProps<'ClothesList'>) {
  const { data, isLoading, isError, refetch, isRefetching } = useClothes();

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator color={colors.primary.DEFAULT} />
      </View>
    );
  }

  if (isError) {
    return (
      <View className="flex-1 bg-background">
        <EmptyState
          title="No pudimos cargar tu armario"
          subtitle="Revisá que la API esté corriendo y volvé a intentar."
        />
        <View className="px-4 pb-8">
          <Button label="Reintentar" onPress={() => void refetch()} />
        </View>
      </View>
    );
  }

  const items = data?.data ?? [];

  return (
    <View className="flex-1 bg-background">
      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <ClothingCard item={item} />}
        contentContainerClassName="p-4"
        refreshing={isRefetching}
        onRefresh={() => void refetch()}
        ListHeaderComponent={
          items.length > 0 ? (
            <Text className="mb-3 text-sm text-text-secondary">
              {data?.total ?? items.length} prenda(s)
            </Text>
          ) : null
        }
        ListEmptyComponent={
          <EmptyState
            title="Tu armario está vacío"
            subtitle="Agregá tu primera prenda para empezar a armar outfits."
          />
        }
      />
      <View className="px-4 pb-8 pt-2">
        <Button
          label="Agregar prenda"
          onPress={() => navigation.navigate('AddClothingItem')}
        />
      </View>
    </View>
  );
}
