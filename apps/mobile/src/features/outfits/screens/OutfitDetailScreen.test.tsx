import { fireEvent, render, screen } from '@testing-library/react-native';

import type { Outfit } from '../../../domain/models/outfit';
import { useArchiveOutfit, useOutfit } from '../hooks/useOutfits';
import { OutfitDetailScreen } from './OutfitDetailScreen';

jest.mock('../hooks/useOutfits');

const mockUseOutfit = useOutfit as jest.MockedFunction<typeof useOutfit>;
const mockUseArchiveOutfit = useArchiveOutfit as jest.MockedFunction<
  typeof useArchiveOutfit
>;

const outfit: Outfit = {
  id: 'o1',
  userId: 'u1',
  name: 'Lunes de oficina',
  isActive: true,
  createdAt: '',
  updatedAt: '',
  items: [
    {
      id: 'i1',
      clothingItemId: 'c1',
      order: 1,
      clothingItem: {
        id: 'c1',
        name: 'Camisa de lino blanca',
        imageUrls: [],
        category: { id: 'cat1', name: 'Camisas' },
        color: { id: 'col1', name: 'Blanco', hexCode: '#EFE9DE' },
      },
    },
  ],
  occasions: [{ id: 'oc1', name: 'Trabajo' }],
  tags: [{ id: 't1', name: 'otoño' }],
};

function makeNavigation() {
  return { goBack: jest.fn(), navigate: jest.fn() } as never;
}

function route() {
  return { params: { id: 'o1' } } as never;
}

describe('OutfitDetailScreen', () => {
  const mutate = jest.fn();

  beforeEach(() => {
    mockUseOutfit.mockReturnValue({
      data: outfit,
      isLoading: false,
      isError: false,
    } as unknown as ReturnType<typeof useOutfit>);
    mockUseArchiveOutfit.mockReturnValue({
      mutate,
      isPending: false,
    } as unknown as ReturnType<typeof useArchiveOutfit>);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renderiza nombre, prenda, ocasión y tag del outfit', () => {
    render(
      <OutfitDetailScreen navigation={makeNavigation()} route={route()} />,
    );

    expect(screen.getByText('Lunes de oficina')).toBeOnTheScreen();
    expect(screen.getByText('Camisa de lino blanca')).toBeOnTheScreen();
    expect(screen.getByText('Trabajo')).toBeOnTheScreen();
    expect(screen.getByText('otoño')).toBeOnTheScreen();
  });

  it('archivar pide confirmación y al confirmar archiva el outfit', () => {
    render(
      <OutfitDetailScreen navigation={makeNavigation()} route={route()} />,
    );

    fireEvent.press(screen.getByTestId('outfit-archive'));
    fireEvent.press(screen.getByTestId('confirm-dialog-confirm'));

    expect(mutate).toHaveBeenCalledWith('o1');
  });
});
