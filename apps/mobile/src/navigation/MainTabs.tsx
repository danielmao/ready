import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text } from 'react-native';

import { ClothesListScreen } from '../features/clothes/screens/ClothesListScreen';
import { OutfitsListScreen } from '../features/outfits/screens/OutfitsListScreen';
import { ProfileScreen } from '../features/profile/screens/ProfileScreen';
import { colors } from '../theme';
import { TabBarIcon } from './TabBarIcon';
import type { MainTabParamList } from './types';

const Tab = createBottomTabNavigator<MainTabParamList>();

const LABELS: Record<keyof MainTabParamList, string> = {
  ArmarioTab: 'Armario',
  OutfitsTab: 'Outfits',
  PerfilTab: 'Perfil',
};

/**
 * Tabs inferiores del diseño Ready.dc (Armario · Outfits · Perfil). Barra flotante clara con
 * ícono + label; activo en petróleo `#003B4A` (label en negrita), inactivo en gris `#90989C`.
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
        tabBarIcon: ({ color }) => (
          <TabBarIcon name={route.name} color={color} />
        ),
        tabBarLabel: ({ color, focused }) => (
          <Text
            style={{ fontSize: 11, color, fontWeight: focused ? '600' : '400' }}
          >
            {LABELS[route.name]}
          </Text>
        ),
      })}
    >
      <Tab.Screen name="ArmarioTab" component={ClothesListScreen} />
      <Tab.Screen name="OutfitsTab" component={OutfitsListScreen} />
      <Tab.Screen name="PerfilTab" component={ProfileScreen} />
    </Tab.Navigator>
  );
}
