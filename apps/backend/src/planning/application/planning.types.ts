import type { OutfitsFacade } from '../../outfits/application/facades/outfits.facade';
import type { PlannedOutfit } from '../domain/entities/planned-outfit.entity';

/**
 * Read-model del outfit tal como lo entrega `OutfitsFacade` (con ítems, ocasiones y tags).
 * Se deriva por inferencia del retorno de la facade —único cruce permitido a `outfits`— para
 * NO importar su entidad `Outfit` de dominio (lo prohíben los boundaries, docs/02 §6). Es una
 * referencia de tipos, sin arista de import a `outfits/domain`.
 */
export type OutfitView = NonNullable<
  Awaited<ReturnType<OutfitsFacade['findActiveOutfitById']>>
>;

/**
 * Respuesta compuesta de planning (`GET`/`POST`/`PUT /api/planning`): el planeado + el outfit
 * hidratado + sus prendas (checklist de HU-05). `outfit` es `null` si el planeado quedó
 * huérfano (su outfit fue archivado).
 */
export interface PlanningView {
  plannedOutfit: PlannedOutfit | null;
  outfit: OutfitView | null;
  items: NonNullable<OutfitView['items']>;
}
