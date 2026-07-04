import { useState } from 'react';
import { Modal, Pressable, Text, View } from 'react-native';

import { fonts } from '../../../theme';

interface SelectOption {
  id: string;
  label: string;
}

interface SelectFieldProps {
  options: SelectOption[];
  value: string | undefined;
  placeholder: string;
  onChange: (id: string) => void;
}

/**
 * Select desplegable (diseño 04): fila blanca con borde + chevron que muestra el valor
 * elegido o el placeholder, y abre una hoja modal con las opciones.
 */
export function SelectField({
  options,
  value,
  placeholder,
  onChange,
}: SelectFieldProps) {
  const [open, setOpen] = useState(false);
  const selected = options.find((o) => o.id === value);

  return (
    <View className="mt-2">
      <Pressable
        testID="select-field"
        onPress={() => setOpen(true)}
        className="h-[50px] flex-row items-center justify-between rounded-[14px] bg-surface-alt px-4"
      >
        <Text
          className={`text-[15px] ${
            selected ? 'text-text-primary' : 'text-text-muted'
          }`}
        >
          {selected?.label ?? placeholder}
        </Text>
        <Text className="text-[13px] text-text-muted">▾</Text>
      </Pressable>

      {open ? (
        <Modal
          transparent
          animationType="fade"
          visible
          onRequestClose={() => setOpen(false)}
        >
          <Pressable
            onPress={() => setOpen(false)}
            className="flex-1 justify-end bg-primary-dark/40"
          >
            <View className="rounded-t-[28px] bg-background px-6 pb-10 pt-6">
              <Text
                className="mb-3 text-[22px] text-text-primary"
                style={{ fontFamily: fonts.serif }}
              >
                {placeholder}
              </Text>
              {options.map((opt) => {
                const active = opt.id === value;
                return (
                  <Pressable
                    key={opt.id}
                    onPress={() => {
                      onChange(opt.id);
                      setOpen(false);
                    }}
                    className={`h-[50px] flex-row items-center justify-between rounded-[14px] px-4 ${
                      active ? 'bg-primary-soft' : ''
                    }`}
                  >
                    <Text
                      className={`text-[15px] ${
                        active ? 'text-primary' : 'text-text-primary'
                      }`}
                    >
                      {opt.label}
                    </Text>
                    {active ? (
                      <Text className="text-primary">✓</Text>
                    ) : null}
                  </Pressable>
                );
              })}
            </View>
          </Pressable>
        </Modal>
      ) : null}
    </View>
  );
}
