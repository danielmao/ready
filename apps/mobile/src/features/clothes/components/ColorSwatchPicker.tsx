import { Pressable, View } from 'react-native';

import type { Color } from '../../../domain/models/clothing';

interface ColorSwatchPickerProps {
  colors: Pick<Color, 'id' | 'name' | 'hexCode'>[];
  value: string | undefined;
  onChange: (colorId: string) => void;
}

/**
 * Selector de color por swatches circulares (diseño 04). El seleccionado lleva un anillo
 * petróleo con separación interior, igual que el mockup.
 */
export function ColorSwatchPicker({
  colors,
  value,
  onChange,
}: ColorSwatchPickerProps) {
  return (
    <View className="mt-2 flex-row flex-wrap gap-2.5">
      {colors.map((color) => {
        const selected = color.id === value;
        return (
          <Pressable
            key={color.id}
            testID={`swatch-${color.id}`}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            onPress={() => onChange(color.id)}
            className={`h-[34px] w-[34px] items-center justify-center rounded-full ${
              selected ? 'border-2 border-primary' : 'border border-border'
            }`}
            style={{ backgroundColor: color.hexCode }}
          >
            {selected ? (
              <View
                testID={`swatch-selected-${color.id}`}
                className="h-full w-full rounded-full border-2 border-surface"
              />
            ) : null}
          </Pressable>
        );
      })}
    </View>
  );
}
