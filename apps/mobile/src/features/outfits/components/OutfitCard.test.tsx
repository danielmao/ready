import { fireEvent, render, screen } from '@testing-library/react-native';

import type { Outfit } from '../../../domain/models/outfit';
import { OutfitCard } from './OutfitCard';

const outfit: Outfit = {
  id: 'o1',
  userId: 'u1',
  name: 'Lunes de oficina',
  isActive: true,
  createdAt: '',
  updatedAt: '',
  items: [
    { id: 'i1', clothingItemId: 'c1', order: 1 },
    { id: 'i2', clothingItemId: 'c2', order: 2 },
  ],
  occasions: [{ id: 'oc1', name: 'Trabajo' }],
};

describe('OutfitCard', () => {
  it('muestra nombre, cantidad de prendas y chip de ocasión', () => {
    render(<OutfitCard outfit={outfit} onPress={jest.fn()} />);

    expect(screen.getByText('Lunes de oficina')).toBeOnTheScreen();
    expect(screen.getByText('2 prendas')).toBeOnTheScreen();
    expect(screen.getByText('Trabajo')).toBeOnTheScreen();
  });

  it('dispara onPress al tocar la tarjeta', () => {
    const onPress = jest.fn();
    render(<OutfitCard outfit={outfit} onPress={onPress} />);

    fireEvent.press(screen.getByTestId('outfit-card'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });
});
