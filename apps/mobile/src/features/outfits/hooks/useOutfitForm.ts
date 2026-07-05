import { useMemo, useState } from 'react';

import type { ClothingItem } from '../../../domain/models/clothing';
import type { CreateOutfitInput, Outfit } from '../../../domain/models/outfit';
import { useOccasions, useTags } from '../../clothes/hooks/useCatalogs';
import { useClothes } from '../../clothes/hooks/useClothes';

/** Opción de chip (ocasión/tag) ya mapeada para la vista. */
export interface ChipOption {
  id: string;
  label: string;
}

interface UseOutfitFormParams {
  onSubmit: (input: CreateOutfitInput) => void;
  /** Outfit a editar (si aplica); prefila nombre, prendas, ocasiones y tags. */
  defaultOutfit?: Outfit;
}

/**
 * Controller hook del formulario de outfit (crear/editar). Concentra la selección ordenada de
 * prendas (≥2), el nombre y las ocasiones/tags, más el mapeo de catálogos. La vista (`OutfitForm`)
 * queda presentacional. Ver `docs/CODING-CONVENTIONS.md §5`.
 */
export function useOutfitForm({ onSubmit, defaultOutfit }: UseOutfitFormParams) {
  const [name, setName] = useState(defaultOutfit?.name ?? '');
  const [search, setSearch] = useState('');
  // Ids de prendas seleccionadas, en orden de selección (define `order`).
  const [selectedIds, setSelectedIds] = useState<string[]>(
    defaultOutfit?.items
      ?.slice()
      .sort((a, b) => a.order - b.order)
      .map((it) => it.clothingItemId) ?? [],
  );
  const [occasionIds, setOccasionIds] = useState<string[]>(
    defaultOutfit?.occasions?.map((o) => o.id) ?? [],
  );
  const [tagIds, setTagIds] = useState<string[]>(
    defaultOutfit?.tags?.map((t) => t.id) ?? [],
  );

  const clothesQuery = useClothes({ search: search.trim() || undefined });
  const occasions = useOccasions();
  const tags = useTags();

  const clothes = clothesQuery.data?.data ?? [];

  const toggleId = (
    id: string,
    setter: React.Dispatch<React.SetStateAction<string[]>>,
  ) =>
    setter((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );

  const toggleItem = (id: string) => toggleId(id, setSelectedIds);
  const toggleOccasion = (id: string) => toggleId(id, setOccasionIds);
  const toggleTag = (id: string) => toggleId(id, setTagIds);

  // Prendas seleccionadas resueltas (para la tira de preview), en orden.
  const selectedItems: ClothingItem[] = useMemo(
    () =>
      selectedIds
        .map((id) => clothes.find((c) => c.id === id))
        .filter((c): c is ClothingItem => Boolean(c)),
    [selectedIds, clothes],
  );

  const occasionOptions: ChipOption[] = (occasions.data ?? []).map((o) => ({
    id: o.id,
    label: `${o.icon ?? ''} ${o.name}`.trim(),
  }));
  const tagOptions: ChipOption[] = (tags.data ?? []).map((t) => ({
    id: t.id,
    label: t.name,
  }));

  const canSubmit = name.trim().length > 0 && selectedIds.length >= 2;

  const submit = () => {
    if (!canSubmit) return;
    onSubmit({
      name: name.trim(),
      outfitItems: selectedIds.map((clothingItemId, index) => ({
        clothingItemId,
        order: index + 1,
      })),
      occasionIds,
      tagIds,
    });
  };

  return {
    state: { name, search, selectedIds, occasionIds, tagIds },
    data: { clothes, selectedItems, occasionOptions, tagOptions },
    actions: {
      setName,
      setSearch,
      toggleItem,
      toggleOccasion,
      toggleTag,
      submit,
    },
    flags: {
      isLoadingClothes: clothesQuery.isLoading,
      selectedCount: selectedIds.length,
      canSubmit,
    },
  };
}
