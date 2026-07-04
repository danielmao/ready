import { TextInput, View } from 'react-native';

import { colors } from '../../../theme';

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
}

/** Buscador de prendas (pantalla 01). Controlado por la pantalla. */
export function SearchBar({
  value,
  onChangeText,
  placeholder = 'Buscar una prenda…',
}: SearchBarProps) {
  return (
    <View className="h-[46px] flex-row items-center gap-2.5 rounded-2xl border border-border bg-surface px-4">
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.text.muted}
        className="flex-1 text-[15px] text-text-primary"
        autoCorrect={false}
        returnKeyType="search"
      />
    </View>
  );
}
