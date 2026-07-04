import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { AddClothingItemScreen } from '../features/clothes/screens/AddClothingItemScreen';
import { ClothesListScreen } from '../features/clothes/screens/ClothesListScreen';
import { ClothingDetailScreen } from '../features/clothes/screens/ClothingDetailScreen';
import { EditClothingItemScreen } from '../features/clothes/screens/EditClothingItemScreen';
import { colors } from '../theme';
import type { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: colors.primary.dark },
          headerTintColor: colors.text.inverse,
          contentStyle: { backgroundColor: colors.background },
        }}
      >
        <Stack.Screen
          name="ClothesList"
          component={ClothesListScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="ClothingDetail"
          component={ClothingDetailScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="AddClothingItem"
          component={AddClothingItemScreen}
          options={{ headerShown: false, presentation: 'modal' }}
        />
        <Stack.Screen
          name="EditClothingItem"
          component={EditClothingItemScreen}
          options={{ title: 'Editar prenda', presentation: 'modal' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
