import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Alert } from 'react-native';

import { useAuth } from '../../../providers/AuthProvider';
import { profileApi } from '../services/profileApi';

/** Query keys de la feature profile. */
export const profileKeys = {
  me: ['profile', 'me'] as const,
};

/**
 * Controller hook del Perfil: trae el usuario logueado y ofrece cerrar sesión. La vista
 * (`ProfileScreen`) queda presentacional (patrón controller-hook, CODING-CONVENTIONS §5).
 */
export function useProfileController() {
  const { signOut } = useAuth();
  const queryClient = useQueryClient();

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: profileKeys.me,
    queryFn: () => profileApi.me(),
  });

  const confirmSignOut = () => {
    Alert.alert('Cerrar sesión', '¿Querés salir de tu cuenta?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Salir',
        style: 'destructive',
        onPress: () => {
          void signOut().then(() => {
            // El próximo usuario no debe ver el armario del anterior en la caché.
            queryClient.clear();
          });
        },
      },
    ]);
  };

  return {
    data: { user: data },
    state: { isLoading, isError },
    actions: { refetch: () => void refetch(), signOut: confirmSignOut },
  };
}
