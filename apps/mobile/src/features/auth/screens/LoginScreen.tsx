import { Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuth } from '../../../providers/AuthProvider';
import { fonts } from '../../../theme';

/**
 * Pantalla de bienvenida / login. En el MVP la auth de Google está **diferida**: el botón no
 * valida nada, sólo marca la sesión como iniciada y deja pasar a la app (single-user en el
 * backend, ver CLAUDE.md §1). Cuando entre OAuth real, acá se cablea el flujo; el resto de la
 * app no cambia.
 */
export function LoginScreen() {
  const { signIn } = useAuth();

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-1 items-center justify-center px-10">
        <View className="h-[96px] w-[96px] items-center justify-center rounded-[28px] bg-primary">
          <Text
            className="text-5xl text-text-inverse"
            style={{ fontFamily: fonts.serif }}
          >
            R
          </Text>
        </View>

        <Text className="mt-8 text-sm font-medium uppercase tracking-[4px] text-secondary">
          Ready
        </Text>
        <Text
          className="mt-2 text-center text-[40px] leading-[1.05] text-text-primary"
          style={{ fontFamily: fonts.serif }}
        >
          Alistá tu próximo outfit
        </Text>
        <Text className="mt-3 text-center text-[15px] leading-relaxed text-text-secondary">
          Tu armario, tus conjuntos y tu próxima salida, listos con antelación.
        </Text>
      </View>

      <View className="px-8 pb-12">
        <Pressable
          testID="google-signin"
          onPress={signIn}
          className="h-[56px] flex-row items-center justify-center gap-3 rounded-2xl border border-border bg-surface"
        >
          <View className="h-6 w-6 items-center justify-center rounded-full bg-surface-alt">
            <Text className="text-base font-bold text-secondary">G</Text>
          </View>
          <Text className="text-base font-medium text-text-primary">
            Continuar con Google
          </Text>
        </Pressable>
        <Text className="mt-4 text-center text-xs text-text-muted">
          Modo demo · el ingreso es de muestra (single-user).
        </Text>
      </View>
    </SafeAreaView>
  );
}
