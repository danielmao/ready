import { fireEvent, render, screen } from '@testing-library/react-native';

import { SelectField } from './SelectField';

const options = [
  { id: 'cat1', label: 'Camisas' },
  { id: 'cat2', label: 'Pantalones' },
];

describe('SelectField', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('muestra el placeholder cuando no hay valor', () => {
    render(
      <SelectField
        options={options}
        value={undefined}
        placeholder="Elegí una categoría"
        onChange={jest.fn()}
      />,
    );

    expect(screen.getByText('Elegí una categoría')).toBeOnTheScreen();
  });

  it('muestra el label del valor seleccionado', () => {
    render(
      <SelectField
        options={options}
        value="cat1"
        placeholder="Elegí una categoría"
        onChange={jest.fn()}
      />,
    );

    expect(screen.getByText('Camisas')).toBeOnTheScreen();
  });

  it('abre las opciones y selecciona una', () => {
    const onChange = jest.fn();
    render(
      <SelectField
        options={options}
        value={undefined}
        placeholder="Elegí una categoría"
        onChange={onChange}
      />,
    );

    fireEvent.press(screen.getByTestId('select-field'));
    fireEvent.press(screen.getByText('Pantalones'));

    expect(onChange).toHaveBeenCalledWith('cat2');
  });
});
