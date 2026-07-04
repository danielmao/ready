import { Pressable, ScrollView, Text } from 'react-native';

import type { Category } from '../../../domain/models/clothing';

interface FilterChipsProps {
  categories: Pick<Category, 'id' | 'name'>[];
  selectedId: string | null;
  onSelect: (categoryId: string | null) => void;
}

/**
 * Fila horizontal de chips de filtro por categoría (pantalla 01). El chip "Todas"
 * limpia el filtro (selecciona `null`).
 */
export function FilterChips({
  categories,
  selectedId,
  onSelect,
}: FilterChipsProps) {
  const chips: { id: string | null; name: string }[] = [
    { id: null, name: 'Todas' },
    ...categories.map((c) => ({ id: c.id, name: c.name })),
  ];

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerClassName="gap-2 px-6 pb-4"
    >
      {chips.map((chip) => {
        const active = chip.id === selectedId;
        return (
          <Pressable
            key={chip.id ?? '__all__'}
            onPress={() => onSelect(chip.id)}
            className={`h-9 items-center justify-center rounded-full px-[18px] ${
              active
                ? 'bg-primary-soft'
                : 'border border-border bg-surface'
            }`}
          >
            <Text
              className={`text-sm ${
                active ? 'font-medium text-primary' : 'text-text-secondary'
              }`}
            >
              {chip.name}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}
