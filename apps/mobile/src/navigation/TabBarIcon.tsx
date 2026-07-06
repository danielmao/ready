import { View } from 'react-native';

import type { MainTabParamList } from './types';

/**
 * Íconos del tab bar dibujados con Views (sin assets externos), calcados del diseño
 * Ready.dc §tab bar: Armario = grilla 2×2, Outfits = 3 barras ascendentes, Perfil = persona.
 * El color lo inyecta React Navigation (activo `#003B4A`, inactivo `#90989C`).
 */
export function TabBarIcon({
  name,
  color,
}: {
  name: keyof MainTabParamList;
  color: string;
}) {
  if (name === 'ArmarioTab') {
    return (
      <View
        style={{
          width: 20,
          height: 20,
          flexDirection: 'row',
          flexWrap: 'wrap',
          gap: 3,
        }}
      >
        {[0, 1, 2, 3].map((i) => (
          <View
            key={i}
            style={{
              width: 8.5,
              height: 8.5,
              borderRadius: 2,
              backgroundColor: color,
            }}
          />
        ))}
      </View>
    );
  }

  if (name === 'OutfitsTab') {
    return (
      <View
        style={{
          width: 20,
          height: 20,
          flexDirection: 'row',
          alignItems: 'flex-end',
          gap: 2,
        }}
      >
        {[0.7, 1, 0.82].map((h, i) => (
          <View
            key={i}
            style={{
              flex: 1,
              height: `${h * 100}%`,
              borderRadius: 2,
              backgroundColor: color,
            }}
          />
        ))}
      </View>
    );
  }

  // PerfilTab — persona (cabeza + hombros).
  return (
    <View style={{ width: 20, height: 20 }}>
      <View
        style={{
          width: 8,
          height: 8,
          borderRadius: 4,
          backgroundColor: color,
          position: 'absolute',
          top: 1,
          left: 6,
        }}
      />
      <View
        style={{
          width: 17,
          height: 9,
          borderTopLeftRadius: 9,
          borderTopRightRadius: 9,
          backgroundColor: color,
          position: 'absolute',
          bottom: 1,
          left: 1.5,
        }}
      />
    </View>
  );
}
