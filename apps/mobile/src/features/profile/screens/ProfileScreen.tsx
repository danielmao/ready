import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { MainTabScreenProps } from '../../../navigation/types';
import { fonts } from '../../../theme';

/**
 * Pantalla · Perfil (tab del diseño). El canvas Ready.dc no detalla su contenido, así que en
 * el MVP es un placeholder con la identidad de marca. Auth de Google está diferida (ver
 * CLAUDE.md §1): por ahora la sesión es single-user con `userId` fijo en el backend.
 */
export function ProfileScreen(_props: MainTabScreenProps<'PerfilTab'>) {
  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <View className="px-6 pb-1 pt-3">
        <Text className="text-sm font-medium uppercase tracking-[3px] text-secondary">
          Ready
        </Text>
        <Text
          className="mt-1.5 text-[42px] leading-none text-text-primary"
          style={{ fontFamily: fonts.serif }}
        >
          Perfil
        </Text>
      </View>

      <View className="flex-1 items-center justify-center px-11">
        <View className="h-[132px] w-[132px] items-center justify-center rounded-full bg-primary-soft">
          <View className="h-3.5 w-3.5 rounded-full bg-primary" />
          <View className="mt-1 h-4 w-8 rounded-t-2xl bg-primary" />
        </View>
        <Text
          className="mt-7 text-center text-[28px] leading-tight text-text-primary"
          style={{ fontFamily: fonts.serif }}
        >
          Tu cuenta, próximamente
        </Text>
        <Text className="mt-2.5 text-center text-[15px] leading-relaxed text-text-secondary">
          Acá vas a poder iniciar sesión con Google y gestionar tus
          preferencias. Por ahora Ready funciona en modo single-user.
        </Text>
      </View>
    </SafeAreaView>
  );
}
