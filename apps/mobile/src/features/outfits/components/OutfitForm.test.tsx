import { fireEvent, render, screen } from '@testing-library/react-native';

import {
  useCategories,
  useOccasions,
  useTags,
} from '../../clothes/hooks/useCatalogs';
import { useClothes } from '../../clothes/hooks/useClothes';
import { OutfitForm } from './OutfitForm';

jest.mock('../../clothes/hooks/useCatalogs');
jest.mock('../../clothes/hooks/useClothes');

const asQuery = (data: unknown) => ({ data }) as never;

beforeEach(() => {
  (useClothes as jest.Mock).mockReturnValue(
    asQuery({
      data: [
        { id: 'c1', name: 'Remera', imageUrls: [] },
        { id: 'c2', name: 'Jean', imageUrls: [] },
      ],
    }),
  );
  (useCategories as jest.Mock).mockReturnValue(asQuery([]));
  (useOccasions as jest.Mock).mockReturnValue(asQuery([]));
  (useTags as jest.Mock).mockReturnValue(asQuery([]));
});

afterEach(() => {
  jest.clearAllMocks();
});

function renderForm() {
  render(
    <OutfitForm
      title="Armar outfit"
      submitLabel="Guardar outfit"
      onSubmit={jest.fn()}
      onCancel={jest.fn()}
    />,
  );
}

describe('OutfitForm', () => {
  it('muestra la bandeja "Tu outfit" con el mensaje inicial vacío', () => {
    renderForm();

    expect(screen.getByText('Tu outfit')).toBeOnTheScreen();
    expect(
      screen.getByText('Elegí prendas de abajo para empezar'),
    ).toBeOnTheScreen();
  });

  it('al tocar una prenda la agrega a la bandeja', () => {
    renderForm();

    expect(screen.queryByTestId('tray-remove')).toBeNull();
    fireEvent.press(screen.getAllByTestId('outfit-pick-item')[0]);
    expect(screen.getByTestId('tray-remove')).toBeOnTheScreen();
  });
});
