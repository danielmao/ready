import { apiClient } from '../../../services/apiClient';
import type {
  DayPlanView,
  PlannedOutfit,
  SetPlannedOutfitInput,
  WeekPlanView,
} from '../../../domain/models/planning';

/** Llamadas HTTP del dominio planning. Toda comunicación con la API pasa por acá. */
export const planningApi = {
  /** La semana (lunes→domingo) que contiene `start`. `start` es cualquier día de esa semana. */
  async getWeek(start: string): Promise<WeekPlanView> {
    const { data } = await apiClient.get<WeekPlanView>('/planning/week', {
      params: { start },
    });
    return data;
  },

  /** El plan de un día suelto. */
  async getDay(day: string): Promise<DayPlanView> {
    const { data } = await apiClient.get<DayPlanView>('/planning', {
      params: { day },
    });
    return data;
  },

  /** Planea un outfit para un día (reemplaza lo que hubiera en ESE día). */
  async set(input: SetPlannedOutfitInput): Promise<DayPlanView> {
    const { data } = await apiClient.post<DayPlanView>('/planning', input);
    return data;
  },

  /** Confirma el planeado de un día (HU-05). */
  async confirm(day: string): Promise<PlannedOutfit> {
    const { data } = await apiClient.put<PlannedOutfit>('/planning/confirm', {
      day,
    });
    return data;
  },

  /** Libera un día del plan. */
  async remove(day: string): Promise<{ success: boolean }> {
    const { data } = await apiClient.delete<{ success: boolean }>(
      `/planning/${day}`,
    );
    return data;
  },
};
