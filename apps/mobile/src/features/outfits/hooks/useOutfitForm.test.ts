import { act, renderHook } from '@testing-library/react-native';

import {
  useCategories,
  useOccasions,
  useTags,
} from '../../clothes/hooks/useCatalogs';
import { useClothes } from '../../clothes/hooks/useClothes';
import { useOutfitForm } from './useOutfitForm';

jest.mock('../../clothes/hooks/useCatalogs');
jest.mock('../../clothes/hooks/useClothes');

const A = 'a3bb189e-8bf9-3888-9912-ace4e6543002';
const B = 'b3bb189e-8bf9-3888-9912-ace4e6543002';
const asQuery = (data: unknown) => ({ data }) as never;

beforeEach(() => {
  (useClothes as jest.Mock).mockReturnValue(
    asQuery({ data: [{ id: A, name: 'Remera' }, { id: B, name: 'Jean' }] }),
  );
  (useCategories as jest.Mock).mockReturnValue(asQuery([]));
  (useOccasions as jest.Mock).mockReturnValue(asQuery([]));
  (useTags as jest.Mock).mockReturnValue(asQuery([]));
});

afterEach(() => {
  jest.clearAllMocks();
});

describe('useOutfitForm', () => {
  it('no permite enviar con menos de 2 prendas', () => {
    const { result } = renderHook(() => useOutfitForm({ onSubmit: jest.fn() }));

    act(() => {
      result.current.actions.setName('Look');
      result.current.actions.toggleItem(A);
    });

    expect(result.current.flags.canSubmit).toBe(false);
  });

  it('submit arma outfitItems ordenados por selección', () => {
    const onSubmit = jest.fn();
    const { result } = renderHook(() => useOutfitForm({ onSubmit }));

    act(() => {
      result.current.actions.setName('Look oficina');
      result.current.actions.toggleItem(B);
      result.current.actions.toggleItem(A);
    });
    act(() => {
      result.current.actions.submit();
    });

    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Look oficina',
        outfitItems: [
          { clothingItemId: B, order: 1 },
          { clothingItemId: A, order: 2 },
        ],
      }),
    );
  });

  it('removeItem saca la prenda de la selección y de la bandeja', () => {
    const { result } = renderHook(() => useOutfitForm({ onSubmit: jest.fn() }));

    act(() => {
      result.current.actions.toggleItem(A);
      result.current.actions.toggleItem(B);
    });
    act(() => {
      result.current.actions.removeItem(A);
    });

    expect(result.current.state.selectedIds).toEqual([B]);
    expect(result.current.data.selectedItems.map((i) => i.id)).toEqual([B]);
  });

  it('isFiltering refleja búsqueda o categoría activa', () => {
    const { result } = renderHook(() => useOutfitForm({ onSubmit: jest.fn() }));

    expect(result.current.flags.isFiltering).toBe(false);
    act(() => {
      result.current.actions.setCategoryId('cat1');
    });
    expect(result.current.flags.isFiltering).toBe(true);
  });
});
