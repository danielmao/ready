import { fireEvent, render, screen } from '@testing-library/react-native';

import type { Tag } from '../../../domain/models/clothing';
import { TagSelector } from './TagSelector';

const tags: Tag[] = [
  { id: 't1', name: 'verano' },
  { id: 't2', name: 'favorita' },
];

describe('TagSelector', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renderiza los tags existentes y el chip para agregar', () => {
    render(
      <TagSelector
        tags={tags}
        selectedIds={[]}
        onToggle={jest.fn()}
        onCreate={jest.fn()}
      />,
    );

    expect(screen.getByText('verano')).toBeOnTheScreen();
    expect(screen.getByText('favorita')).toBeOnTheScreen();
    expect(screen.getByText('+ Agregar tag')).toBeOnTheScreen();
  });

  it('togglea un tag por su id', () => {
    const onToggle = jest.fn();
    render(
      <TagSelector
        tags={tags}
        selectedIds={[]}
        onToggle={onToggle}
        onCreate={jest.fn()}
      />,
    );

    fireEvent.press(screen.getByText('verano'));

    expect(onToggle).toHaveBeenCalledWith('t1');
  });

  it('crea un tag nuevo desde el input inline', () => {
    const onCreate = jest.fn();
    render(
      <TagSelector
        tags={tags}
        selectedIds={[]}
        onToggle={jest.fn()}
        onCreate={onCreate}
      />,
    );

    fireEvent.press(screen.getByText('+ Agregar tag'));
    fireEvent.changeText(screen.getByPlaceholderText('Nuevo tag'), 'lino');
    fireEvent.press(screen.getByText('Agregar'));

    expect(onCreate).toHaveBeenCalledWith('lino');
  });
});
