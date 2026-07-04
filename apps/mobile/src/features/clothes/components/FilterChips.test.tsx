import { fireEvent, render, screen } from '@testing-library/react-native';

import { FilterChips } from './FilterChips';

const categories = [
  { id: 'cat1', name: 'Camisas' },
  { id: 'cat2', name: 'Pantalones' },
];

describe('FilterChips', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renderiza el chip "Todas" más uno por categoría', () => {
    render(
      <FilterChips categories={categories} selectedId={null} onSelect={jest.fn()} />,
    );

    expect(screen.getByText('Todas')).toBeOnTheScreen();
    expect(screen.getByText('Camisas')).toBeOnTheScreen();
    expect(screen.getByText('Pantalones')).toBeOnTheScreen();
  });

  it('selecciona una categoría por su id', () => {
    const onSelect = jest.fn();
    render(
      <FilterChips categories={categories} selectedId={null} onSelect={onSelect} />,
    );

    fireEvent.press(screen.getByText('Pantalones'));

    expect(onSelect).toHaveBeenCalledWith('cat2');
  });

  it('"Todas" limpia el filtro (selecciona null)', () => {
    const onSelect = jest.fn();
    render(
      <FilterChips categories={categories} selectedId="cat1" onSelect={onSelect} />,
    );

    fireEvent.press(screen.getByText('Todas'));

    expect(onSelect).toHaveBeenCalledWith(null);
  });
});
