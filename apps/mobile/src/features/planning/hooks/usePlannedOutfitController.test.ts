import { act, renderHook } from '@testing-library/react-native';

import {
  useConfirmPlannedOutfit,
  usePlannedOutfit,
  useRemovePlannedOutfit,
} from './usePlanning';
import { usePlannedOutfitController } from './usePlannedOutfitController';

jest.mock('./usePlanning');

const navigation = { navigate: jest.fn(), goBack: jest.fn() } as never;
const confirmMutate = jest.fn();
const removeMutate = jest.fn();

beforeEach(() => {
  (useConfirmPlannedOutfit as jest.Mock).mockReturnValue({
    mutate: confirmMutate,
    isPending: false,
  });
  (useRemovePlannedOutfit as jest.Mock).mockReturnValue({
    mutate: removeMutate,
    isPending: false,
  });
});

afterEach(() => {
  jest.clearAllMocks();
});

describe('usePlannedOutfitController', () => {
  it('marca isEmpty cuando no hay planeado', () => {
    (usePlannedOutfit as jest.Mock).mockReturnValue({
      data: { plannedOutfit: null, outfit: null, items: [] },
      isLoading: false,
      isError: false,
    });

    const { result } = renderHook(() =>
      usePlannedOutfitController(navigation),
    );

    expect(result.current.flags.isEmpty).toBe(true);
  });

  it('expone el outfit y confirma vía la mutación', () => {
    (usePlannedOutfit as jest.Mock).mockReturnValue({
      data: {
        plannedOutfit: { id: 'p1', status: 'planned' },
        outfit: { id: 'o1', name: 'Look' },
        items: [{ id: 'i1' }],
      },
      isLoading: false,
      isError: false,
    });

    const { result } = renderHook(() =>
      usePlannedOutfitController(navigation),
    );

    expect(result.current.flags.isEmpty).toBe(false);
    expect(result.current.flags.isConfirmed).toBe(false);

    act(() => {
      result.current.actions.confirm();
    });
    expect(confirmMutate).toHaveBeenCalled();
  });
});
