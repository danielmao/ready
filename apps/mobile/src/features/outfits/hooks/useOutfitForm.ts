import { useMemo, useRef, useState } from 'react';

import type { Category, ClothingItem } from '../../../domain/models/clothing';
import type { CreateOutfitInput, Outfit } from '../../../domain/models/outfit';
import { useCategories, useOccasions, useTags } from '../../clothes/hooks/useCatalogs';
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
 * prendas (≥2), la búsqueda/filtro del armario, el nombre y las ocasiones/tags. La vista
 * (`OutfitForm`) queda presentacional. Ver `docs/CODING-CONVENTIONS.md §5`.
 */
export function useOutfitForm({ onSubmit, defaultOutfit }: UseOutfitFormParams) {
  const [name, setName] = useState(defaultOutfit?.name ?? '');
  const [search, setSearch] = useState('');
  const [categoryId, setCategoryId] = useState<string | null>(null);
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

  const clothesQuery = useClothes({
    search: search.trim() || undefined,
    categoryId: categoryId ?? undefined,
  });
  const categories = useCategories();
  const occasions = useOccasions();
  const tags = useTags();

  const clothes = clothesQuery.data?.data ?? [];

  // Caché de prendas conocidas (por id): acumula lo que se vio en la grilla + las del outfit
  // en edición. Resolver las seleccionadas contra esta caché evita que la bandeja se vacíe al
  // buscar/filtrar (el filtro achica `clothes`, pero la elegida sigue siendo parte del outfit).
  const knownItems = useRef<Map<string, ClothingItem>>(new Map());
  if (defaultOutfit?.items) {
    for (const it of defaultOutfit.items) {
      if (it.clothingItem && !knownItems.current.has(it.clothingItemId)) {
        // El read-model embebido alcanza para la bandeja (id, name, imageUrls).
        knownItems.current.set(
          it.clothingItemId,
          it.clothingItem as unknown as ClothingItem,
        );
      }
    }
  }
  for (const c of clothes) knownItems.current.set(c.id, c);

  const toggleId = (
    id: string,
    setter: React.Dispatch<React.SetStateAction<string[]>>,
  ) =>
    setter((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );

  const toggleItem = (id: string) => toggleId(id, setSelectedIds);
  const removeItem = (id: string) =>
    setSelectedIds((prev) => prev.filter((x) => x !== id));
  const toggleOccasion = (id: string) => toggleId(id, setOccasionIds);
  const toggleTag = (id: string) => toggleId(id, setTagIds);
  const clearSearch = () => setSearch('');

  // Prendas seleccionadas resueltas (para la bandeja), en orden, contra la caché.
  const selectedItems: ClothingItem[] = useMemo(
    () =>
      selectedIds
        .map((id) => knownItems.current.get(id))
        .filter((c): c is ClothingItem => Boolean(c)),
    [selectedIds, clothes],
  );

  const categoryOptions: Pick<Category, 'id' | 'name'>[] = (
    categories.data ?? []
  ).map((c) => ({ id: c.id, name: c.name }));
  const occasionOptions: ChipOption[] = (occasions.data ?? []).map((o) => ({
    id: o.id,
    label: `${o.icon ?? ''} ${o.name}`.trim(),
  }));
  const tagOptions: ChipOption[] = (tags.data ?? []).map((t) => ({
    id: t.id,
    label: t.name,
  }));

  const isFiltering = search.trim().length > 0 || categoryId !== null;
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
    state: { name, search, categoryId, selectedIds, occasionIds, tagIds },
    data: {
      clothes,
      selectedItems,
      categoryOptions,
      occasionOptions,
      tagOptions,
    },
    actions: {
      setName,
      setSearch,
      clearSearch,
      setCategoryId,
      toggleItem,
      removeItem,
      toggleOccasion,
      toggleTag,
      submit,
    },
    flags: {
      isLoadingClothes: clothesQuery.isLoading,
      isFiltering,
      selectedCount: selectedIds.length,
      canSubmit,
    },
  };
}
