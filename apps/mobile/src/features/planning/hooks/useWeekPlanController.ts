import { useState } from 'react';

import type { MainTabScreenProps } from '../../../navigation/types';
import {
  DAYS_IN_WEEK,
  addDaysKey,
  startOfWeekKey,
  todayKey,
  weekdayIndex,
} from '../../../shared/utils/week';
import {
  useConfirmPlannedOutfit,
  useRemovePlannedOutfit,
  useWeekPlan,
} from './usePlanning';

/**
 * Controller hook del **home**: la semana planeada. Maneja qué semana se mira, qué día está
 * seleccionado, y las acciones sobre ese día (confirmar / quitar / elegir outfit). La vista
 * (`WeekPlanScreen`) queda presentacional (`docs/CODING-CONVENTIONS.md §5`).
 */
export function useWeekPlanController(
  navigation: MainTabScreenProps<'HomeTab'>['navigation'],
) {
  // `today` se congela al montar: recalcularlo en cada render haría que la selección saltara
  // sola si la app queda abierta cruzando la medianoche.
  const [today] = useState(todayKey);
  const [selectedDay, setSelectedDay] = useState(today);
  const weekStart = startOfWeekKey(selectedDay);

  const { data, isLoading, isError, refetch, isRefetching } = useWeekPlan(weekStart);
  const confirm = useConfirmPlannedOutfit();
  const remove = useRemovePlannedOutfit();
  const [confirmRemove, setConfirmRemove] = useState(false);

  const days = data?.days ?? [];
  // Mientras carga la semana, la tira se pinta igual con los 7 días vacíos: así no salta el
  // layout ni desaparece el día elegido entre semana y semana.
  const dayKeys = Array.from({ length: DAYS_IN_WEEK }, (_, i) =>
    addDaysKey(weekStart, i),
  );
  const selected = days.find((day) => day.date === selectedDay) ?? null;

  /** Cambia de semana conservando el mismo día de la semana (lunes sigue en lunes). */
  const shiftWeek = (weeks: number) =>
    setSelectedDay((current) =>
      addDaysKey(startOfWeekKey(current), weeks * DAYS_IN_WEEK + weekdayIndex(current)),
    );

  const handleRemove = () => {
    remove.mutate(selectedDay);
    setConfirmRemove(false);
  };

  return {
    data: {
      weekStart,
      weekEnd: data?.weekEnd ?? addDaysKey(weekStart, DAYS_IN_WEEK - 1),
      dayKeys,
      days,
      selected,
      selectedDay,
      today,
    },
    state: { confirmRemove },
    actions: {
      selectDay: setSelectedDay,
      prevWeek: () => shiftWeek(-1),
      nextWeek: () => shiftWeek(1),
      goToday: () => setSelectedDay(today),
      refetch: () => void refetch(),
      confirm: () => confirm.mutate(selectedDay),
      askRemove: () => setConfirmRemove(true),
      cancelRemove: () => setConfirmRemove(false),
      handleRemove,
      goToPicker: () => navigation.navigate('PlanPicker', { day: selectedDay }),
      goToDetail: (id: string) => navigation.navigate('OutfitDetail', { id }),
    },
    flags: {
      isLoading,
      isError,
      isRefetching,
      isConfirmed: selected?.plannedOutfit?.status === 'confirmed',
      isFree: !selected?.plannedOutfit,
      /** Planeado cuyo outfit fue archivado: hay fila, pero no hay qué mostrar. */
      isOrphan: Boolean(selected?.plannedOutfit) && !selected?.outfit,
      isCurrentWeek: weekStart === startOfWeekKey(today),
      plannedCount: days.filter((day) => day.plannedOutfit).length,
      confirming: confirm.isPending,
      removing: remove.isPending,
    },
  };
}
