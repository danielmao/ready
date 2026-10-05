import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { Alert } from 'react-native';

import { useAuth } from '../../../providers/AuthProvider';
import { profileApi } from '../services/profileApi';

/** Query keys de la feature profile. */
export const profileKeys = {
  me: ['profile', 'me'] as const,
};

function getSaveErrorMessage(error: unknown): string | null {
  if (!error) return null;

  const message = (
    error as {
      response?: { data?: { message?: string | string[] } };
    }
  ).response?.data?.message;

  if (Array.isArray(message)) return message[0] ?? null;
  return message ?? 'No pudimos guardar el nombre.';
}

/**
 * Controller hook del Perfil: trae el usuario logueado y ofrece cerrar sesión. La vista
 * (`ProfileScreen`) queda presentacional (patrón controller-hook, CODING-CONVENTIONS §5).
 */
export function useProfileController() {
  const { signOut } = useAuth();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState('');

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: profileKeys.me,
    queryFn: () => profileApi.me(),
  });

  const updateProfile = useMutation({
    mutationFn: profileApi.updateMe,
    onSuccess: (updatedUser) => {
      queryClient.setQueryData(profileKeys.me, updatedUser);
      setName(updatedUser.name);
      setIsEditing(false);
    },
  });

  const startEdit = () => {
    setName(data?.name ?? '');
    updateProfile.reset();
    setIsEditing(true);
  };

  const cancel = () => {
    setName(data?.name ?? '');
    updateProfile.reset();
    setIsEditing(false);
  };

  const save = () => {
    const trimmedName = name.trim();
    if (!trimmedName) return;
    updateProfile.mutate({ name: trimmedName });
  };

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
    state: {
      isLoading,
      isError,
      isEditing,
      name,
      isSaving: updateProfile.isPending,
      saveError: getSaveErrorMessage(updateProfile.error),
    },
    flags: { canSave: name.trim().length > 0 },
    actions: {
      refetch: () => void refetch(),
      signOut: confirmSignOut,
      startEdit,
      setName,
      save,
      cancel,
    },
  };
}
