import { apiClient } from '../../../services/apiClient';
import type {
  PlannedOutfit,
  PlanningView,
  SetPlannedOutfitInput,
  UpdatePlannedOutfitInput,
} from '../../../domain/models/planning';

/** Llamadas HTTP del dominio planning. Toda comunicación con la API pasa por acá. */
export const planningApi = {
  async get(): Promise<PlanningView> {
    const { data } = await apiClient.get<PlanningView>('/planning');
    return data;
  },

  async set(input: SetPlannedOutfitInput): Promise<PlanningView> {
    const { data } = await apiClient.post<PlanningView>('/planning', input);
    return data;
  },

  async update(input: UpdatePlannedOutfitInput): Promise<PlanningView> {
    const { data } = await apiClient.put<PlanningView>('/planning', input);
    return data;
  },

  async confirm(): Promise<PlannedOutfit> {
    const { data } = await apiClient.put<PlannedOutfit>('/planning/confirm');
    return data;
  },

  async remove(): Promise<{ success: boolean }> {
    const { data } = await apiClient.delete<{ success: boolean }>('/planning');
    return data;
  },
};
