import { Injectable } from '@nestjs/common';

import { OutfitsFacade } from '../../../outfits/application/facades/outfits.facade';
import { PlannedOutfit } from '../../domain/entities/planned-outfit.entity';
import { toDayString } from '../../domain/week';
import type { DayPlanView, OutfitView } from '../planning.types';

/**
 * Arma los `DayPlanView` a partir de los planeados crudos, hidratando cada outfit vía
 * `OutfitsFacade` (único cruce permitido a `outfits`). Vive acá —y no en cada use-case— porque
 * la semana y el día comparten exactamente la misma composición.
 *
 * Deduplica por `outfitId`: si el mismo outfit está planeado varios días de la semana, se pide
 * una sola vez a la facade en vez de siete.
 */
@Injectable()
export class PlanHydrationService {
  constructor(private readonly outfits: OutfitsFacade) {}

  /** Un día suelto (libre si `planned` es null). */
  async hydrateDay(
    day: Date,
    planned: PlannedOutfit | null,
    userId: string,
  ): Promise<DayPlanView> {
    const [view] = await this.hydrateDays([day], planned ? [planned] : [], userId);
    return view;
  }

  /**
   * Los días pedidos, en orden, cada uno con su planeado activo si lo tiene. Un planeado cuyo
   * día no esté en `days` se ignora.
   */
  async hydrateDays(
    days: Date[],
    planned: PlannedOutfit[],
    userId: string,
  ): Promise<DayPlanView[]> {
    const byDay = new Map<string, PlannedOutfit>();
    for (const p of planned) {
      if (p.plannedFor) byDay.set(toDayString(p.plannedFor), p);
    }

    const outfits = await this.loadOutfits(
      [...new Set([...byDay.values()].map((p) => p.outfitId))],
      userId,
    );

    return days.map((day) => {
      const date = toDayString(day);
      const plannedOutfit = byDay.get(date) ?? null;
      const outfit = plannedOutfit
        ? (outfits.get(plannedOutfit.outfitId) ?? null)
        : null;
      return { date, plannedOutfit, outfit, items: outfit?.items ?? [] };
    });
  }

  private async loadOutfits(
    ids: string[],
    userId: string,
  ): Promise<Map<string, OutfitView>> {
    const found = await Promise.all(
      ids.map((id) => this.outfits.findActiveOutfitById(id, userId)),
    );
    const map = new Map<string, OutfitView>();
    found.forEach((outfit, i) => {
      // null = el outfit fue archivado; el día queda "huérfano" y la app ofrece re-elegir.
      if (outfit) map.set(ids[i], outfit);
    });
    return map;
  }
}
