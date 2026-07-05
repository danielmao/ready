import { fireEvent, render, screen } from '@testing-library/react-native';

import { OutfitsEmptyState } from './OutfitsEmptyState';

describe('OutfitsEmptyState', () => {
  it('muestra título, subtítulo y CTA', () => {
    render(<OutfitsEmptyState onPressCreate={jest.fn()} />);

    expect(screen.getByText('Todavía no armaste outfits')).toBeOnTheScreen();
    expect(screen.getByText('Armar mi primer outfit')).toBeOnTheScreen();
  });

  it('el CTA dispara onPressCreate', () => {
    const onPressCreate = jest.fn();
    render(<OutfitsEmptyState onPressCreate={onPressCreate} />);

    fireEvent.press(screen.getByText('Armar mi primer outfit'));
    expect(onPressCreate).toHaveBeenCalledTimes(1);
  });
});
