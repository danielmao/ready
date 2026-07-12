import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { LoginScreen } from '../features/auth/screens/LoginScreen';
import { AddClothingItemScreen } from '../features/clothes/screens/AddClothingItemScreen';
import { ClothingDetailScreen } from '../features/clothes/screens/ClothingDetailScreen';
import { EditClothingItemScreen } from '../features/clothes/screens/EditClothingItemScreen';
import { AddOutfitScreen } from '../features/outfits/screens/AddOutfitScreen';
import { EditOutfitScreen } from '../features/outfits/screens/EditOutfitScreen';
import { OutfitDetailScreen } from '../features/outfits/screens/OutfitDetailScreen';
import { PlanPickerScreen } from '../features/planning/screens/PlanPickerScreen';
import { useAuth } from '../providers/AuthProvider';
import { colors } from '../theme';
import { MainTabs } from './MainTabs';
import type { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

/**
 * Stack raíz. Actúa de gate de sesión: sin sesión iniciada muestra `Login`; con sesión, aloja
 * los tabs (`MainTabs`) y apila por encima los detalles/altas/ediciones. La transición entre
 * features (Armario ↔ Outfits ↔ Planear ↔ Perfil) la manejan los tabs; navegar a un detalle
 * desde una pantalla-tab lo empuja sobre la barra de tabs.
 */
export function RootNavigator() {
  const { isAuthenticated } = useAuth();

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: colors.primary.dark },
          headerTintColor: colors.text.inverse,
          contentStyle: { backgroundColor: colors.background },
        }}
      >
        {!isAuthenticated ? (
          <Stack.Screen
            name="Login"
            component={LoginScreen}
            options={{ headerShown: false }}
          />
        ) : (
          <>
        <Stack.Screen
          name="MainTabs"
          component={MainTabs}
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
        <Stack.Screen
          name="PlanPicker"
          component={PlanPickerScreen}
          options={{ headerShown: false, presentation: 'modal' }}
        />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
