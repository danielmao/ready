import { PlannedOutfit } from '../../domain/entities/planned-outfit.entity';

/** Datos para planear un outfit en un día concreto (ya validados por el use-case). */
export interface NewPlannedOutfit {
  userId: string;
  outfitId: string;
  /** Medianoche UTC del día planeado. Obligatorio: en el plan semanal todo cuelga de un día. */
  plannedFor: Date;
}

/**
 * Contrato del repositorio de planeados. Lo define `application` (no conoce Prisma); lo
 * implementa `infrastructure/persistence`. Tipos en entidades de dominio, nunca modelos Prisma.
 *
 * Invariante del plan semanal: **un solo planeado activo por (usuario, día)**. Se sostiene en
 * `create`, que cancela el activo de ese día dentro de la misma transacción.
 */
export interface PlannedOutfitRepository {
  /** El planeado activo (status ≠ cancelled) del usuario para ese día, o null. */
  findActiveByDay(userId: string, day: Date): Promise<PlannedOutfit | null>;

  /** Los planeados activos del usuario en el rango `[from, to]` (ambos inclusive, por día). */
  findActiveBetween(
    userId: string,
    from: Date,
    to: Date,
  ): Promise<PlannedOutfit[]>;

  /**
   * Planea un outfit para un día CANCELANDO atómicamente el activo de ese mismo día.
   * Devuelve el recién creado (status=planned). No toca el resto de la semana.
   */
  create(data: NewPlannedOutfit): Promise<PlannedOutfit>;

  /** Marca un planeado como `confirmed` (HU-05) y lo devuelve. */
  confirm(id: string): Promise<PlannedOutfit>;

  /** Quita (cancela) el planeado activo de ese día. Idempotente a nivel fila. */
  cancelDay(userId: string, day: Date): Promise<void>;
}

export const PLANNED_OUTFIT_REPOSITORY = Symbol('PlannedOutfitRepository');
