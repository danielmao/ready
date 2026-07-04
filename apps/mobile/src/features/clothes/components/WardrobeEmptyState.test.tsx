import { fireEvent, render, screen } from '@testing-library/react-native';

import { WardrobeEmptyState } from './WardrobeEmptyState';

describe('WardrobeEmptyState', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('muestra el título, subtítulo y CTA del armario vacío', () => {
    render(<WardrobeEmptyState onPressAdd={jest.fn()} />);

    expect(screen.getByText('Tu armario está vacío')).toBeOnTheScreen();
    expect(screen.getByText('Agregá tu primera prenda')).toBeOnTheScreen();
    expect(screen.getByTestId('hanger-illustration')).toBeOnTheScreen();
  });

  it('dispara onPressAdd al tocar el CTA', () => {
    const onPressAdd = jest.fn();
    render(<WardrobeEmptyState onPressAdd={onPressAdd} />);

    fireEvent.press(screen.getByText('Agregá tu primera prenda'));

    expect(onPressAdd).toHaveBeenCalledTimes(1);
  });
});
