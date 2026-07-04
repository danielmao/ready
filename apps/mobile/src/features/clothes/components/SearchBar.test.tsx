import { fireEvent, render, screen } from '@testing-library/react-native';

import { SearchBar } from './SearchBar';

describe('SearchBar', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('muestra el placeholder y refleja el valor', () => {
    render(
      <SearchBar value="lino" onChangeText={jest.fn()} placeholder="Buscar una prenda…" />,
    );

    expect(screen.getByPlaceholderText('Buscar una prenda…')).toHaveDisplayValue(
      'lino',
    );
  });

  it('dispara onChangeText al escribir', () => {
    const onChangeText = jest.fn();
    render(
      <SearchBar value="" onChangeText={onChangeText} placeholder="Buscar una prenda…" />,
    );

    fireEvent.changeText(
      screen.getByPlaceholderText('Buscar una prenda…'),
      'camisa',
    );

    expect(onChangeText).toHaveBeenCalledWith('camisa');
  });
});
