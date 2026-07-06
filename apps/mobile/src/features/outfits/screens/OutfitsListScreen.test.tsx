import { fireEvent, render, screen } from '@testing-library/react-native';

import type { Outfit } from '../../../domain/models/outfit';
import { useOutfits } from '../hooks/useOutfits';
import { OutfitsListScreen } from './OutfitsListScreen';

jest.mock('../hooks/useOutfits');

const mockUseOutfits = useOutfits as jest.MockedFunction<typeof useOutfits>;

const outfit: Outfit = {
  id: 'o1',
  userId: 'u1',
  name: 'Lunes de oficina',
  isActive: true,
  createdAt: '',
  updatedAt: '',
  items: [{ id: 'i1', clothingItemId: 'c1', order: 1 }],
  occasions: [],
};

function outfitsResult(items: Outfit[], overrides = {}) {
  return {
    data: { data: items, total: items.length, page: 1, limit: 20 },
    isLoading: false,
    isError: false,
    isRefetching: false,
    refetch: jest.fn(),
    ...overrides,
  } as unknown as ReturnType<typeof useOutfits>;
}

function makeNavigation() {
  return { navigate: jest.fn() } as never;
}

describe('OutfitsListScreen', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renderiza una tarjeta por outfit y navega al detalle al tocarla', () => {
    mockUseOutfits.mockReturnValue(outfitsResult([outfit]));
    const navigation = makeNavigation();

    render(<OutfitsListScreen navigation={navigation} route={{} as never} />);

    expect(screen.getByText('Lunes de oficina')).toBeOnTheScreen();
    fireEvent.press(screen.getByTestId('outfit-card'));
    expect(
      (navigation as { navigate: jest.Mock }).navigate,
    ).toHaveBeenCalledWith('OutfitDetail', { id: 'o1' });
  });

  it('muestra el estado vacío cuando no hay outfits', () => {
    mockUseOutfits.mockReturnValue(outfitsResult([]));

    render(
      <OutfitsListScreen navigation={makeNavigation()} route={{} as never} />,
    );

    expect(screen.getByText('Todavía no armaste outfits')).toBeOnTheScreen();
  });

  it('el FAB navega al alta de outfit', () => {
    mockUseOutfits.mockReturnValue(outfitsResult([outfit]));
    const navigation = makeNavigation();

    render(<OutfitsListScreen navigation={navigation} route={{} as never} />);

    fireEvent.press(screen.getByTestId('add-outfit-fab'));
    expect(
      (navigation as { navigate: jest.Mock }).navigate,
    ).toHaveBeenCalledWith('AddOutfit');
  });
});
