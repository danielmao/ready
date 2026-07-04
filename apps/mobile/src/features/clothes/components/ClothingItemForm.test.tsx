import {
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react-native';

import {
  useCategories,
  useColors,
  useOccasions,
} from '../hooks/useCatalogs';
import { useUploadClothingImage } from '../hooks/useClothes';
import { ClothingItemForm } from './ClothingItemForm';

jest.mock('expo-image-picker');
jest.mock('../hooks/useCatalogs');
jest.mock('../hooks/useClothes');

const CAT = 'a3bb189e-8bf9-3888-9912-ace4e6543002';
const COL = 'b3bb189e-8bf9-3888-9912-ace4e6543002';

const asQuery = (data: unknown) => ({ data }) as never;

beforeEach(() => {
  (useCategories as jest.Mock).mockReturnValue(
    asQuery([{ id: CAT, name: 'Camisas' }]),
  );
  (useColors as jest.Mock).mockReturnValue(
    asQuery([{ id: COL, name: 'Blanco', hexCode: '#fff' }]),
  );
  (useOccasions as jest.Mock).mockReturnValue(asQuery([]));
  (useUploadClothingImage as jest.Mock).mockReturnValue({
    mutate: jest.fn(),
    isPending: false,
    isError: false,
  });
});

afterEach(() => {
  jest.clearAllMocks();
});

describe('ClothingItemForm', () => {
  it('prefila los valores y muestra el label de submit', () => {
    render(
      <ClothingItemForm
        submitLabel="Guardar cambios"
        defaultValues={{ name: 'Camisa de lino', categoryId: CAT, colorId: COL }}
        onSubmit={jest.fn()}
      />,
    );

    expect(screen.getByDisplayValue('Camisa de lino')).toBeOnTheScreen();
    expect(screen.getByText('Guardar cambios')).toBeOnTheScreen();
  });

  it('al guardar emite onSubmit con los valores del formulario', async () => {
    const onSubmit = jest.fn();
    render(
      <ClothingItemForm
        submitLabel="Guardar cambios"
        defaultValues={{ name: 'Camisa de lino', categoryId: CAT, colorId: COL }}
        onSubmit={onSubmit}
      />,
    );

    fireEvent.changeText(
      screen.getByDisplayValue('Camisa de lino'),
      'Camisa de lino blanca',
    );
    fireEvent.press(screen.getByText('Guardar cambios'));

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    expect(onSubmit.mock.calls[0][0]).toMatchObject({
      name: 'Camisa de lino blanca',
      categoryId: CAT,
      colorId: COL,
    });
  });
});
