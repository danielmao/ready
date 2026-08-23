import { act, renderHook } from '@testing-library/react-native';

import {
  useConfirmPlannedOutfit,
  useRemovePlannedOutfit,
  useWeekPlan,
} from './usePlanning';
import { useWeekPlanController } from './useWeekPlanController';

jest.mock('./usePlanning');

const navigation = { navigate: jest.fn(), goBack: jest.fn() } as never;
const confirmMutate = jest.fn();
const removeMutate = jest.fn();

/** Congela "hoy" en el domingo 2026-08-23 (semana del lunes 17) para que el test no dependa del reloj. */
const TODAY = new Date(2026, 7, 23, 10, 0, 0);

function mockWeek(days: unknown[]) {
  (useWeekPlan as jest.Mock).mockReturnValue({
    data: { weekStart: '2026-08-17', weekEnd: '2026-08-23', days },
    isLoading: false,
    isError: false,
  });
}

beforeEach(() => {
  jest.useFakeTimers().setSystemTime(TODAY);
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
  jest.useRealTimers();
  jest.clearAllMocks();
});

describe('useWeekPlanController', () => {
  it('arranca en hoy y expone los 7 días de su semana', () => {
    mockWeek([]);

    const { result } = renderHook(() => useWeekPlanController(navigation));

    expect(result.current.data.selectedDay).toBe('2026-08-23');
    expect(result.current.data.weekStart).toBe('2026-08-17');
    expect(result.current.data.dayKeys).toHaveLength(7);
    expect(result.current.flags.isCurrentWeek).toBe(true);
  });

  it('marca el día libre cuando no tiene planeado', () => {
    mockWeek([
      { date: '2026-08-23', plannedOutfit: null, outfit: null, items: [] },
    ]);

    const { result } = renderHook(() => useWeekPlanController(navigation));

    expect(result.current.flags.isFree).toBe(true);
  });

  it('al seleccionar otro día muestra su outfit y confirma ESE día', () => {
    mockWeek([
      {
        date: '2026-08-19',
        plannedOutfit: { id: 'p1', status: 'planned' },
        outfit: { id: 'o1', name: 'Look' },
        items: [{ id: 'i1' }],
      },
      { date: '2026-08-23', plannedOutfit: null, outfit: null, items: [] },
    ]);

    const { result } = renderHook(() => useWeekPlanController(navigation));

    act(() => {
      result.current.actions.selectDay('2026-08-19');
    });
    expect(result.current.data.selected?.outfit).toMatchObject({ id: 'o1' });
    expect(result.current.flags.isFree).toBe(false);

    act(() => {
      result.current.actions.confirm();
    });
    expect(confirmMutate).toHaveBeenCalledWith('2026-08-19');
  });

  it('cambiar de semana conserva el día de la semana y permite volver a hoy', () => {
    mockWeek([]);

    const { result } = renderHook(() => useWeekPlanController(navigation));

    act(() => {
      result.current.actions.nextWeek();
    });
    // Domingo 23 → domingo 30; la semana pasa a arrancar el lunes 24.
    expect(result.current.data.selectedDay).toBe('2026-08-30');
    expect(result.current.data.weekStart).toBe('2026-08-24');
    expect(result.current.flags.isCurrentWeek).toBe(false);

    act(() => {
      result.current.actions.goToday();
    });
    expect(result.current.data.selectedDay).toBe('2026-08-23');
  });

  it('detecta el planeado huérfano (outfit archivado)', () => {
    mockWeek([
      {
        date: '2026-08-23',
        plannedOutfit: { id: 'p1', status: 'planned' },
        outfit: null,
        items: [],
      },
    ]);

    const { result } = renderHook(() => useWeekPlanController(navigation));

    expect(result.current.flags.isOrphan).toBe(true);
    expect(result.current.flags.isFree).toBe(false);
  });

  it('lleva el día seleccionado al picker', () => {
    mockWeek([]);

    const { result } = renderHook(() => useWeekPlanController(navigation));

    act(() => {
      result.current.actions.goToPicker();
    });
    expect((navigation as unknown as { navigate: jest.Mock }).navigate).toHaveBeenCalledWith(
      'PlanPicker',
      { day: '2026-08-23' },
    );
  });
});
