import { fireEvent, render, screen } from '@testing-library/react-native';

import { ColorSwatchPicker } from './ColorSwatchPicker';

const colors = [
  { id: 'col1', name: 'Blanco', hexCode: '#EFE9DE' },
  { id: 'col2', name: 'Petróleo', hexCode: '#003B4A' },
];

describe('ColorSwatchPicker', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renderiza un swatch por color', () => {
    render(
      <ColorSwatchPicker colors={colors} value={undefined} onChange={jest.fn()} />,
    );

    expect(screen.getByTestId('swatch-col1')).toBeOnTheScreen();
    expect(screen.getByTestId('swatch-col2')).toBeOnTheScreen();
  });

  it('selecciona un color por su id', () => {
    const onChange = jest.fn();
    render(
      <ColorSwatchPicker colors={colors} value={undefined} onChange={onChange} />,
    );

    fireEvent.press(screen.getByTestId('swatch-col2'));

    expect(onChange).toHaveBeenCalledWith('col2');
  });

  it('marca el swatch seleccionado', () => {
    render(
      <ColorSwatchPicker colors={colors} value="col1" onChange={jest.fn()} />,
    );

    expect(screen.getByTestId('swatch-selected-col1')).toBeOnTheScreen();
    expect(screen.queryByTestId('swatch-selected-col2')).toBeNull();
  });
});
