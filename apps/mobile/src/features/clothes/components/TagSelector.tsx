import { useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';

import type { Tag } from '../../../domain/models/clothing';
import { colors as palette } from '../../../theme';

interface TagSelectorProps {
  tags: Tag[];
  selectedIds: string[];
  onToggle: (tagId: string) => void;
  onCreate: (name: string) => void;
}

/**
 * Selector de tags (diseño 04): tags existentes como chips toggleables + "+ Agregar tag"
 * que abre un input inline para crear uno nuevo. La creación la resuelve el consumidor.
 */
export function TagSelector({
  tags,
  selectedIds,
  onToggle,
  onCreate,
}: TagSelectorProps) {
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState('');

  const confirm = () => {
    const name = draft.trim();
    if (!name) return;
    onCreate(name);
    setDraft('');
    setAdding(false);
  };

  return (
    <View className="mt-2 gap-3">
      <View className="flex-row flex-wrap gap-2.5">
        {tags.map((tag) => {
          const selected = selectedIds.includes(tag.id);
          return (
            <Pressable
              key={tag.id}
              onPress={() => onToggle(tag.id)}
              className={`rounded-full px-[15px] py-2 ${
                selected
                  ? 'bg-primary-soft'
                  : 'border border-border bg-surface'
              }`}
            >
              <Text
                className={`text-[13px] ${
                  selected ? 'text-primary' : 'text-text-secondary'
                }`}
              >
                {tag.name}
              </Text>
            </Pressable>
          );
        })}

        <Pressable
          onPress={() => setAdding(true)}
          className="rounded-full border border-dashed border-border px-[15px] py-2"
        >
          <Text className="text-[13px] text-text-muted">+ Agregar tag</Text>
        </Pressable>
      </View>

      {adding ? (
        <View className="flex-row items-center gap-2.5">
          <TextInput
            value={draft}
            onChangeText={setDraft}
            placeholder="Nuevo tag"
            placeholderTextColor={palette.text.muted}
            autoFocus
            onSubmitEditing={confirm}
            className="flex-1 rounded-[14px] border border-border bg-surface px-4 py-2.5 text-[15px] text-text-primary"
          />
          <Pressable
            onPress={confirm}
            className="rounded-[14px] bg-primary px-4 py-2.5"
          >
            <Text className="text-[14px] font-medium text-text-inverse">
              Agregar
            </Text>
          </Pressable>
        </View>
      ) : null}
    </View>
  );
}
