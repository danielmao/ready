/**
 * Estado de un planeado. Espejo del enum Prisma `PlannedStatus`, pero declarado acá como unión
 * de dominio para no filtrar `@prisma/client` fuera de infrastructure/persistence.
 *  - `planned`   → es el próximo outfit activo (el que la app muestra).
 *  - `confirmed` → el usuario salió con él (HU-05). Sigue siendo el activo hasta fijar otro.
 *  - `cancelled` → reemplazado por uno nuevo o quitado por el usuario. Ya no es activo.
 */
export type PlannedStatus = 'planned' | 'confirmed' | 'cancelled';

/**
 * PlannedOutfit: el "próximo outfit" del usuario. Raíz del dominio `planning`. Invariante MVP:
 * un único activo por usuario (status ≠ cancelled). Clase plana: sin framework ni Prisma. El
 * outfit referenciado (`outfitId`) se hidrata aparte vía `OutfitsFacade`, nunca embebido acá
 * (los boundaries prohíben importar el dominio `outfits`).
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
