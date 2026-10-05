import { fireEvent, render, screen } from '@testing-library/react-native';

import type { MainTabScreenProps } from '../../../navigation/types';
import { useProfileController } from '../hooks/useProfileController';
import { ProfileScreen } from './ProfileScreen';

jest.mock('../hooks/useProfileController');

const mockUseProfileController = useProfileController as jest.MockedFunction<
  typeof useProfileController
>;

function controllerResult(overrides: Record<string, unknown> = {}) {
  return {
    data: {
      user: {
        id: 'u1',
        name: 'Ana',
        email: 'ana@example.com',
        photoUrl: null,
      },
    },
    state: {
      isLoading: false,
      isError: false,
      isEditing: false,
      name: 'Ana',
      isSaving: false,
      saveError: null,
    },
    flags: { canSave: true },
    actions: {
      refetch: jest.fn(),
      signOut: jest.fn(),
      startEdit: jest.fn(),
      setName: jest.fn(),
      save: jest.fn(),
      cancel: jest.fn(),
    },
    ...overrides,
  } as ReturnType<typeof useProfileController>;
}

function makeProps() {
  return {
    navigation: {},
    route: {},
  } as unknown as MainTabScreenProps<'PerfilTab'>;
}

describe('ProfileScreen', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('permite iniciar la edición y guardar el nombre', () => {
    const startEdit = jest.fn();
    mockUseProfileController.mockReturnValue(
      controllerResult({
        actions: {
          ...controllerResult().actions,
          startEdit,
        },
      }),
    );
    const view = render(<ProfileScreen {...makeProps()} />);

    fireEvent.press(screen.getByTestId('profile-start-edit'));
    expect(startEdit).toHaveBeenCalledTimes(1);

    const setName = jest.fn();
    const save = jest.fn();
    mockUseProfileController.mockReturnValue(
      controllerResult({
        state: { ...controllerResult().state, isEditing: true },
        actions: { ...controllerResult().actions, setName, save },
      }),
    );
    view.rerender(<ProfileScreen {...makeProps()} />);

    fireEvent.changeText(screen.getByTestId('profile-name-input'), 'Ana María');
    fireEvent.press(screen.getByTestId('profile-save'));

    expect(setName).toHaveBeenCalledWith('Ana María');
    expect(save).toHaveBeenCalledTimes(1);
  });

  it('deshabilita Guardar cuando el nombre queda vacío tras recortarlo', () => {
    const save = jest.fn();
    mockUseProfileController.mockReturnValue(
      controllerResult({
        state: {
          ...controllerResult().state,
          isEditing: true,
          name: '   ',
        },
        flags: { canSave: false },
        actions: { ...controllerResult().actions, save },
      }),
    );

    render(<ProfileScreen {...makeProps()} />);

    expect(screen.getByTestId('profile-save')).toBeDisabled();
    fireEvent.press(screen.getByTestId('profile-save'));
    expect(save).not.toHaveBeenCalled();
  });
});
