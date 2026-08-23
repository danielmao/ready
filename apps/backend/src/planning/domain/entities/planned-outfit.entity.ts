/**
 * Estado de un planeado. Espejo del enum Prisma `PlannedStatus`, pero declarado acá como unión
 * de dominio para no filtrar `@prisma/client` fuera de infrastructure/persistence.
 *  - `planned`   → es lo planeado para ese día (lo que la app muestra en la semana).
 *  - `confirmed` → el usuario salió con él (HU-05). Sigue siendo el activo de ese día.
 *  - `cancelled` → reemplazado por otro en el mismo día, o quitado por el usuario.
 */
export type PlannedStatus = 'planned' | 'confirmed' | 'cancelled';

/**
 * PlannedOutfit: el outfit planeado para un día. Raíz del dominio `planning`. Invariante:
 * un único activo **por usuario y día** (status ≠ cancelled); distintos días conviven, y así
 * el usuario arma su semana completa.
 *
 * `plannedFor` es el día a medianoche UTC (ver `domain/week.ts`). Es nullable sólo por las
 * filas heredadas del MVP "un solo próximo outfit", que no tenían día; todo lo que se crea
 * hoy lo lleva siempre. El outfit referenciado (`outfitId`) se hidrata aparte vía
 * `OutfitsFacade`, nunca embebido acá (los boundaries prohíben importar el dominio `outfits`).
 */
export class PlannedOutfit {
  id!: string;
  userId!: string;
  outfitId!: string;
  plannedFor!: Date | null;
  status!: PlannedStatus;
  createdAt!: Date;
  updatedAt!: Date;

  constructor(data: Partial<PlannedOutfit> = {}) {
    Object.assign(this, data);
  }
}
