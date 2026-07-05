import { act, renderHook } from '@testing-library/react-native';

import {
  useCategories,
  useColors,
  useOccasions,
  useTags,
} from './useCatalogs';
import { useCreateTag, useUploadClothingImage } from './useClothes';
import { useClothingItemForm } from './useClothingItemForm';

jest.mock('./useCatalogs');
jest.mock('./useClothes');

const CAT = 'a3bb189e-8bf9-3888-9912-ace4e6543002';
const COL = 'b3bb189e-8bf9-3888-9912-ace4e6543002';
const asQuery = (data: unknown) => ({ data }) as never;

beforeEach(() => {
  (useCategories as jest.Mock).mockReturnValue(
    asQuery([{ id: CAT, name: 'Camisas', icon: '👕' }]),
  );
  (useColors as jest.Mock).mockReturnValue(asQuery([{ id: COL, name: 'Blanco' }]));
  (useOccasions as jest.Mock).mockReturnValue(asQuery([]));
  (useTags as jest.Mock).mockReturnValue(asQuery([]));
  (useCreateTag as jest.Mock).mockReturnValue({ mutate: jest.fn() });
  (useUploadClothingImage as jest.Mock).mockReturnValue({
    mutate: jest.fn(),
    isPending: false,
  });
});

afterEach(() => {
  jest.clearAllMocks();
});

describe('useClothingItemForm', () => {
  it('mapea los catálogos a opciones de chip para la vista', () => {
    const { result } = renderHook(() =>
      useClothingItemForm({ onSubmit: jest.fn() }),
    );

    expect(result.current.data.categoryOptions).toEqual([
      { id: CAT, label: '👕 Camisas' },
    ]);
  });

  it('submit emite onSubmit con los valores y la imagen cuando el form es válido', async () => {
    const onSubmit = jest.fn();
    const { result } = renderHook(() =>
      useClothingItemForm({
        onSubmit,
        defaultValues: { name: 'Remera', categoryId: CAT, colorId: COL },
      }),
    );

    await act(async () => {
      await result.current.actions.submit();
    });

    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'Remera', categoryId: CAT, colorId: COL }),
      null,
    );
  });
});
