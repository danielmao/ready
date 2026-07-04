import { fireEvent, render, screen } from '@testing-library/react-native';

import type { ClothingItem } from '../../../domain/models/clothing';
import type { RootStackScreenProps } from '../../../navigation/types';
import {
  useArchiveClothingItem,
  useClothingItem,
} from '../hooks/useClothes';
import { ClothingDetailScreen } from './ClothingDetailScreen';

jest.mock('../hooks/useClothes');

const mockUseClothingItem = useClothingItem as jest.MockedFunction<
  typeof useClothingItem
>;
const mockUseArchive = useArchiveClothingItem as jest.MockedFunction<
  typeof useArchiveClothingItem
>;

const item: ClothingItem = {
  id: 'c1',
  userId: 'u1',
  name: 'Camisa de lino blanca',
  categoryId: 'cat1',
  colorId: 'col1',
  description: 'Camisa oversize de lino lavado.',
  imageUrls: [],
  isActive: true,
  createdAt: '',
  updatedAt: '',
  category: { id: 'cat1', name: 'Camisas' },
  color: { id: 'col1', name: 'Blanco hueso', hexCode: '#EFE9DE' },
  occasions: [{ id: 'o1', name: 'Trabajo', isGlobal: true }],
  tags: [{ id: 't1', name: 'verano' }],
};

function detailResult(data: ClothingItem | undefined) {
  return {
    data,
    isLoading: false,
    isError: false,
    refetch: jest.fn(),
  } as unknown as ReturnType<typeof useClothingItem>;
}

function makeProps(id = 'c1') {
  return {
    navigation: { goBack: jest.fn(), navigate: jest.fn() },
    route: { params: { id } },
  } as unknown as RootStackScreenProps<'ClothingDetail'>;
}

describe('ClothingDetailScreen', () => {
  beforeEach(() => {
    mockUseArchive.mockReturnValue({
      mutate: jest.fn(),
      isPending: false,
    } as unknown as ReturnType<typeof useArchiveClothingItem>);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('muestra los datos de la prenda (nombre, color, descripción, ocasiones, tags)', () => {
    mockUseClothingItem.mockReturnValue(detailResult(item));

    render(<ClothingDetailScreen {...makeProps()} />);

    expect(screen.getByText('Camisa de lino blanca')).toBeOnTheScreen();
    expect(screen.getByText('Blanco hueso')).toBeOnTheScreen();
    expect(screen.getByText('Camisa oversize de lino lavado.')).toBeOnTheScreen();
    expect(screen.getByText('Trabajo')).toBeOnTheScreen();
    expect(screen.getByText('verano')).toBeOnTheScreen();
  });

  it('muestra la barra de acción con las tres acciones', () => {
    mockUseClothingItem.mockReturnValue(detailResult(item));

    render(<ClothingDetailScreen {...makeProps()} />);

    expect(screen.getByText('Usar en un outfit')).toBeOnTheScreen();
    expect(screen.getByText('Editar')).toBeOnTheScreen();
    expect(screen.getByText('Archivar')).toBeOnTheScreen();
  });

  it('el botón back vuelve atrás', () => {
    mockUseClothingItem.mockReturnValue(detailResult(item));
    const props = makeProps();

    render(<ClothingDetailScreen {...props} />);

    fireEvent.press(screen.getByTestId('detail-back'));
    expect(props.navigation.goBack as jest.Mock).toHaveBeenCalledTimes(1);
  });
});
