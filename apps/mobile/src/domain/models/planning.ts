/**
 * Tipos espejo del dominio backend `planning` (apps/backend/src/planning). Mantener
 * sincronizados con docs/04-API-SPECIFICATION.md §Planning.
 */
import type { Outfit, OutfitItem } from './outfit';

/** Estado de un planeado (espejo del enum backend). */
export type PlannedStatus = 'planned' | 'confirmed' | 'cancelled';

/** Un outfit planeado para un día concreto de la semana. */
export interface PlannedOutfit {
  id: string;
  userId: string;
  outfitId: string;
  /** Día planeado en ISO (el backend lo guarda a medianoche UTC). */
  plannedFor: string | null;
  status: PlannedStatus;
  createdAt: string;
  updatedAt: string;
}

/**
 * Un día del plan. `plannedOutfit` null = día libre; `outfit` null con `plannedOutfit` presente
 * = el outfit fue archivado y hay que re-elegir.
 */
export interface DayPlanView {
  /** `YYYY-MM-DD`, la clave del día en toda la API de planning. */
  date: string;
  plannedOutfit: PlannedOutfit | null;
  outfit: Outfit | null;
  items: OutfitItem[];
}

/** Respuesta de `GET /api/planning/week`: los 7 días (lunes→domingo), libres incluidos. */
export interface WeekPlanView {
  weekStart: string;
  weekEnd: string;
  days: DayPlanView[];
}

/** Body de `POST /api/planning`. */
export interface SetPlannedOutfitInput {
  outfitId: string;
  /** `YYYY-MM-DD` — lo calcula el cliente con su fecha local. */
  day: string;
}
