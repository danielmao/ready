import { fireEvent, render, screen } from '@testing-library/react-native';

import type { ClothingItem } from '../../../domain/models/clothing';
import type { RootStackScreenProps } from '../../../navigation/types';
import {
  useClothingItem,
  useUpdateClothingItem,
} from '../hooks/useClothes';
import { EditClothingItemScreen } from './EditClothingItemScreen';

jest.mock('../hooks/useClothes');

// Stub del form: expone un botón que dispara onSubmit con valores fijos.
jest.mock('../components/ClothingItemForm', () => ({
  ClothingItemForm: ({
    onSubmit,
    submitLabel,
  }: {
    onSubmit: (v: unknown, url: string | null) => void;
    submitLabel: string;
  }) => {
    const { Text, Pressable } = require('react-native');
    return (
      <Pressable
        onPress={() =>
          onSubmit(
            { name: 'Camisa editada', categoryId: 'cat1', colorId: 'col1' },
            'http://img/new.jpg',
          )
        }
      >
        <Text>{submitLabel}</Text>
      </Pressable>
    );
  },
}));

const mockUseClothingItem = useClothingItem as jest.MockedFunction<
  typeof useClothingItem
>;
const mockUseUpdate = useUpdateClothingItem as jest.MockedFunction<
  typeof useUpdateClothingItem
>;

const item: ClothingItem = {
  id: 'c1',
  userId: 'u1',
  name: 'Camisa',
  categoryId: 'cat1',
  colorId: 'col1',
  imageUrls: ['http://img/old.jpg'],
  isActive: true,
  createdAt: '',
  updatedAt: '',
};

function makeProps(id = 'c1') {
  return {
    navigation: { goBack: jest.fn() },
    route: { params: { id } },
  } as unknown as RootStackScreenProps<'EditClothingItem'>;
}

describe('EditClothingItemScreen', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('muestra el spinner mientras carga la prenda', () => {
    mockUseClothingItem.mockReturnValue({
      data: undefined,
      isLoading: true,
    } as unknown as ReturnType<typeof useClothingItem>);
    mockUseUpdate.mockReturnValue({
      mutate: jest.fn(),
      isPending: false,
    } as unknown as ReturnType<typeof useUpdateClothingItem>);

    render(<EditClothingItemScreen {...makeProps()} />);

    expect(screen.getByTestId('edit-loading')).toBeOnTheScreen();
  });

  it('al guardar llama a update.mutate con el id y el input', () => {
    const mutate = jest.fn();
    mockUseClothingItem.mockReturnValue({
      data: item,
      isLoading: false,
    } as unknown as ReturnType<typeof useClothingItem>);
    mockUseUpdate.mockReturnValue({
      mutate,
      isPending: false,
    } as unknown as ReturnType<typeof useUpdateClothingItem>);

    render(<EditClothingItemScreen {...makeProps()} />);

    fireEvent.press(screen.getByText('Guardar cambios'));

    expect(mutate).toHaveBeenCalledTimes(1);
    const arg = mutate.mock.calls[0][0];
    expect(arg.id).toBe('c1');
    expect(arg.input).toMatchObject({
      name: 'Camisa editada',
      imageUrls: ['http://img/new.jpg'],
    });
  });
});
