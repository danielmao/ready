import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { AddClothingItemScreen } from '../features/clothes/screens/AddClothingItemScreen';
import { ClothesListScreen } from '../features/clothes/screens/ClothesListScreen';
import { ClothingDetailScreen } from '../features/clothes/screens/ClothingDetailScreen';
import { EditClothingItemScreen } from '../features/clothes/screens/EditClothingItemScreen';
import { AddOutfitScreen } from '../features/outfits/screens/AddOutfitScreen';
import { EditOutfitScreen } from '../features/outfits/screens/EditOutfitScreen';
import { OutfitDetailScreen } from '../features/outfits/screens/OutfitDetailScreen';
import { OutfitsListScreen } from '../features/outfits/screens/OutfitsListScreen';
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
          options={{ headerShown: false, presentation: 'modal' }}
        />
        <Stack.Screen
          name="OutfitsList"
          component={OutfitsListScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="OutfitDetail"
          component={OutfitDetailScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="AddOutfit"
          component={AddOutfitScreen}
          options={{ headerShown: false, presentation: 'modal' }}
        />
        <Stack.Screen
          name="EditOutfit"
          component={EditOutfitScreen}
          options={{ headerShown: false, presentation: 'modal' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
