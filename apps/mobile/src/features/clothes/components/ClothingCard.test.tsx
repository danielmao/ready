import { fireEvent, render, screen } from '@testing-library/react-native';

import type { ClothingItem } from '../../../domain/models/clothing';
import { ClothingCard } from './ClothingCard';

const baseItem: ClothingItem = {
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

describe('ClothingCard', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('muestra nombre y categoría de la prenda', () => {
    render(<ClothingCard item={baseItem} onPress={jest.fn()} />);

    expect(screen.getByText('Camisa de lino blanca')).toBeOnTheScreen();
    expect(screen.getByText('Camisas')).toBeOnTheScreen();
  });

  it('dispara onPress al tocar la tarjeta', () => {
    const onPress = jest.fn();
    render(<ClothingCard item={baseItem} onPress={onPress} />);

    fireEvent.press(screen.getByTestId('clothing-card'));

    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('muestra un placeholder cuando la prenda no tiene foto', () => {
    render(<ClothingCard item={baseItem} onPress={jest.fn()} />);

    expect(screen.getByTestId('clothing-card-placeholder')).toBeOnTheScreen();
  });
});
