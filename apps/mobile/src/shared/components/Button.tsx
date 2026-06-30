import { ActivityIndicator, Pressable, Text } from 'react-native';

interface ButtonProps {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: 'primary' | 'ghost';
}

/** Botón reutilizable (RN puro + NativeWind). */
export function Button({
  label,
  onPress,
  disabled = false,
  loading = false,
  variant = 'primary',
}: ButtonProps) {
  const isPrimary = variant === 'primary';
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      className={`flex-row items-center justify-center rounded-2xl px-5 py-3.5 ${
        isPrimary ? 'bg-primary' : 'bg-transparent'
      } ${disabled || loading ? 'opacity-50' : ''}`}
    >
      {loading ? (
        <ActivityIndicator color={isPrimary ? '#FFFFFF' : '#6366F1'} />
      ) : (
        <Text
          className={`text-base font-semibold ${
            isPrimary ? 'text-white' : 'text-primary'
          }`}
        >
          {label}
        </Text>
      )}
    </Pressable>
  );
}
