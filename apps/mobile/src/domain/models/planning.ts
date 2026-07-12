/**
 * Tipos espejo del dominio backend `planning` (apps/backend/src/planning). Mantener
 * sincronizados con docs/04-API-SPECIFICATION.md §Planning.
 */
import type { Outfit, OutfitItem } from './outfit';

/** Estado de un planeado (espejo del enum backend). */
export type PlannedStatus = 'planned' | 'confirmed' | 'cancelled';

/** El "próximo outfit" del usuario. */
export interface PlannedOutfit {
  id: string;
  userId: string;
  outfitId: string;
  plannedFor: string | null;
  status: PlannedStatus;
  createdAt: string;
  updatedAt: string;
}

/**
 * Respuesta compuesta de `GET`/`POST`/`PUT /api/planning`: el planeado + el outfit hidratado +
 * sus prendas (checklist). Cuando no hay planeado, todo viene en null/vacío.
 */
export interface PlanningView {
  plannedOutfit: PlannedOutfit | null;
  outfit: Outfit | null;
  items: OutfitItem[];
}

/** Body de `POST /api/planning`. */
export interface SetPlannedOutfitInput {
  outfitId: string;
  plannedFor?: string | null;
}

/** Body de `PUT /api/planning`. */
export interface UpdatePlannedOutfitInput {
  outfitId?: string;
  plannedFor?: string | null;
}
