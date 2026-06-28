import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { AddClothingItemScreen } from '../features/clothes/screens/AddClothingItemScreen';
import { ClothesListScreen } from '../features/clothes/screens/ClothesListScreen';
import type { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: '#0F172A' },
          headerTintColor: '#FFFFFF',
          contentStyle: { backgroundColor: '#F8FAFC' },
        }}
      >
        <Stack.Screen
          name="ClothesList"
          component={ClothesListScreen}
          options={{ title: 'Mi armario' }}
        />
        <Stack.Screen
          name="AddClothingItem"
          component={AddClothingItemScreen}
          options={{ title: 'Nueva prenda', presentation: 'modal' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
