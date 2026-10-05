import {
  ActivityIndicator,
  Image,
  Pressable,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { MainTabScreenProps } from '../../../navigation/types';
import { colors, fonts } from '../../../theme';
import { useProfileController } from '../hooks/useProfileController';

/**
 * Pantalla · Perfil (tab del diseño). Muestra la cuenta de Google con la que entraste y
 * permite cerrar sesión. Presentacional: toda la lógica vive en `useProfileController`.
 */
export function ProfileScreen(_props: MainTabScreenProps<'PerfilTab'>) {
  const { data, state, flags, actions } = useProfileController();
  const { user } = data;

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
        {state.isLoading ? (
          <ActivityIndicator color={colors.primary.DEFAULT} />
        ) : state.isError ? (
          <>
            <Text className="text-center text-[15px] leading-relaxed text-text-secondary">
              No pudimos cargar tu perfil.
            </Text>
            <Pressable
              onPress={actions.refetch}
              className="mt-5 h-11 items-center justify-center rounded-2xl border border-border px-6"
            >
              <Text className="text-[15px] font-medium text-text-primary">
                Reintentar
              </Text>
            </Pressable>
          </>
        ) : (
          <>
            {user?.photoUrl ? (
              <Image
                source={{ uri: user.photoUrl }}
                className="h-[132px] w-[132px] rounded-full"
              />
            ) : (
              <View className="h-[132px] w-[132px] items-center justify-center rounded-full bg-primary-soft">
                <Text
                  className="text-5xl text-primary"
                  style={{ fontFamily: fonts.serif }}
                >
                  {user?.name?.[0]?.toUpperCase() ?? 'R'}
                </Text>
              </View>
            )}
            {state.isEditing ? (
              <View className="mt-7 w-full">
                <TextInput
                  testID="profile-name-input"
                  value={state.name}
                  onChangeText={actions.setName}
                  editable={!state.isSaving}
                  autoFocus
                  autoCapitalize="words"
                  returnKeyType="done"
                  onSubmitEditing={actions.save}
                  className="h-[50px] rounded-2xl border border-border bg-surface px-4 text-center text-[18px] text-text-primary"
                  placeholder="Tu nombre"
                  placeholderTextColor={colors.text.muted}
                />
                {state.saveError ? (
                  <Text className="mt-2 text-center text-sm text-error">
                    {state.saveError}
                  </Text>
                ) : null}
                <View className="mt-4 flex-row gap-3">
                  <Pressable
                    testID="profile-cancel"
                    onPress={actions.cancel}
                    disabled={state.isSaving}
                    className="h-11 flex-1 items-center justify-center rounded-2xl border border-border bg-surface"
                  >
                    <Text className="text-[15px] font-medium text-text-secondary">
                      Cancelar
                    </Text>
                  </Pressable>
                  <Pressable
                    testID="profile-save"
                    onPress={actions.save}
                    disabled={!flags.canSave || state.isSaving}
                    className={`h-11 flex-1 items-center justify-center rounded-2xl bg-primary ${
                      !flags.canSave || state.isSaving ? 'opacity-50' : ''
                    }`}
                  >
                    {state.isSaving ? (
                      <ActivityIndicator color={colors.text.inverse} />
                    ) : (
                      <Text className="text-[15px] font-medium text-text-inverse">
                        Guardar
                      </Text>
                    )}
                  </Pressable>
                </View>
              </View>
            ) : (
              <View className="mt-7 items-center">
                <Text
                  className="text-center text-[28px] leading-tight text-text-primary"
                  style={{ fontFamily: fonts.serif }}
                >
                  {user?.name}
                </Text>
                <Pressable
                  testID="profile-start-edit"
                  onPress={actions.startEdit}
                  className="mt-2 px-3 py-1.5"
                >
                  <Text className="text-sm font-medium text-primary">Editar nombre</Text>
                </Pressable>
              </View>
            )}
            <Text className="mt-1.5 text-center text-[15px] text-text-secondary">
              {user?.email}
            </Text>
          </>
        )}
      </View>

      <View className="px-8 pb-10">
        <Pressable
          testID="sign-out"
          onPress={actions.signOut}
          className="h-[52px] items-center justify-center rounded-2xl border border-border bg-surface"
        >
          <Text className="text-base font-medium text-error">
            Cerrar sesión
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
