import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import { ClothesListScreen } from '../features/clothes/screens/ClothesListScreen';
import { OutfitsListScreen } from '../features/outfits/screens/OutfitsListScreen';
import { ProfileScreen } from '../features/profile/screens/ProfileScreen';
import { colors } from '../theme';
import { TabBarIcon } from './TabBarIcon';
import type { MainTabParamList } from './types';

const Tab = createBottomTabNavigator<MainTabParamList>();

/**
 * Tabs inferiores del diseño Ready.dc (Armario · Outfits · Perfil). Barra flotante clara con
 * ícono + label; activo en petróleo `#003B4A`, inactivo en gris `#90989C`.
 */
export function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primary.DEFAULT,
        tabBarInactiveTintColor: colors.text.muted,
        tabBarStyle: {
          height: 82,
          paddingTop: 11,
          paddingBottom: 22,
          backgroundColor: 'rgba(255,255,255,0.94)',
          borderTopColor: '#E4DCD3',
          borderTopWidth: 1,
        },
        tabBarLabelStyle: { fontSize: 11 },
        tabBarIcon: ({ color }) => (
          <TabBarIcon name={route.name} color={color} />
        ),
      })}
    >
      <Tab.Screen
        name="ArmarioTab"
        component={ClothesListScreen}
        options={{ tabBarLabel: 'Armario' }}
      />
      <Tab.Screen
        name="OutfitsTab"
        component={OutfitsListScreen}
        options={{ tabBarLabel: 'Outfits' }}
      />
      <Tab.Screen
        name="PerfilTab"
        component={ProfileScreen}
        options={{ tabBarLabel: 'Perfil' }}
      />
    </Tab.Navigator>
  );
}
