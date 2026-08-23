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
 * Un día del plan: la fecha + qué hay planeado en ella. `plannedOutfit` es `null` si el día
 * está libre; `outfit` es `null` además cuando el planeado quedó huérfano (su outfit fue
 * archivado), en cuyo caso la app ofrece re-elegir.
 */
export interface DayPlanView {
  /** `YYYY-MM-DD` — la clave del día en toda la API de planning. */
  date: string;
  plannedOutfit: PlannedOutfit | null;
  outfit: OutfitView | null;
  items: NonNullable<OutfitView['items']>;
}

/**
 * Respuesta de `GET /api/planning/week`: los 7 días (lunes→domingo) de una semana, siempre
 * completos —los días libres viajan con `plannedOutfit: null`— para que la home los pinte sin
 * tener que inventar huecos.
 */
export interface WeekPlanView {
  /** Lunes de la semana, `YYYY-MM-DD`. */
  weekStart: string;
  /** Domingo de la semana, `YYYY-MM-DD`. */
  weekEnd: string;
  days: DayPlanView[];
}
