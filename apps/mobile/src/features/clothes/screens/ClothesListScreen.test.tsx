import { fireEvent, render, screen } from '@testing-library/react-native';

import type { ClothingItem } from '../../../domain/models/clothing';
import { useCategories } from '../hooks/useCatalogs';
import { useClothes } from '../hooks/useClothes';
import { ClothesListScreen } from './ClothesListScreen';

jest.mock('../hooks/useClothes');
jest.mock('../hooks/useCatalogs');

const mockUseClothes = useClothes as jest.MockedFunction<typeof useClothes>;
const mockUseCategories = useCategories as jest.MockedFunction<
  typeof useCategories
>;

const item: ClothingItem = {
  id: 'c1',
  userId: 'u1',
  name: 'Camisa de lino blanca',
  categoryId: 'cat1',
  colorId: 'col1',
  imageUrls: [],
  isActive: true,
  createdAt: '',
  updatedAt: '',
  category: { id: 'cat1', name: 'Camisas' },
  color: { id: 'col1', name: 'Blanco hueso', hexCode: '#EFE9DE' },
};

function clothesResult(items: ClothingItem[]) {
  return {
    data: { data: items, total: items.length, page: 1, limit: 20 },
    isLoading: false,
    isError: false,
    isRefetching: false,
    refetch: jest.fn(),
  } as unknown as ReturnType<typeof useClothes>;
}

function makeNavigation() {
  return { navigate: jest.fn() } as never;
}

describe('ClothesListScreen', () => {
  beforeEach(() => {
    mockUseCategories.mockReturnValue({
      data: [{ id: 'cat1', name: 'Camisas' }],
    } as unknown as ReturnType<typeof useCategories>);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renderiza una tarjeta por prenda y navega al detalle al tocarla', () => {
    mockUseClothes.mockReturnValue(clothesResult([item]));
    const navigation = makeNavigation();

    render(
      <ClothesListScreen navigation={navigation} route={{} as never} />,
    );

    expect(screen.getByText('Camisa de lino blanca')).toBeOnTheScreen();

    fireEvent.press(screen.getByTestId('clothing-card'));
    expect((navigation as { navigate: jest.Mock }).navigate).toHaveBeenCalledWith(
      'ClothingDetail',
      { id: 'c1' },
    );
  });

  it('muestra el estado vacío del armario cuando no hay prendas', () => {
    mockUseClothes.mockReturnValue(clothesResult([]));

    render(
      <ClothesListScreen navigation={makeNavigation()} route={{} as never} />,
    );

    expect(screen.getByText('Tu armario está vacío')).toBeOnTheScreen();
  });

  it('el FAB navega al alta de prenda', () => {
    mockUseClothes.mockReturnValue(clothesResult([item]));
    const navigation = makeNavigation();

    render(
      <ClothesListScreen navigation={navigation} route={{} as never} />,
    );

    fireEvent.press(screen.getByTestId('add-clothing-fab'));
    expect((navigation as { navigate: jest.Mock }).navigate).toHaveBeenCalledWith(
      'AddClothingItem',
    );
  });
});
