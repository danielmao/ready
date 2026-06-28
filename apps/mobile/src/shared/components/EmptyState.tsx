import { Text, View } from 'react-native';

interface EmptyStateProps {
  title: string;
  subtitle?: string;
}

/** Estado vacío reutilizable. */
export function EmptyState({ title, subtitle }: EmptyStateProps) {
  return (
    <View className="flex-1 items-center justify-center px-8 py-16">
      <Text className="text-lg font-semibold text-ink">{title}</Text>
      {subtitle ? (
        <Text className="mt-1 text-center text-sm text-muted">{subtitle}</Text>
      ) : null}
    </View>
  );
}
