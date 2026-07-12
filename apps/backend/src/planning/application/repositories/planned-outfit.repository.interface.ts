import { PlannedOutfit } from '../../domain/entities/planned-outfit.entity';

/** Datos para fijar un nuevo próximo outfit (ya validado por el use-case). */
export interface NewPlannedOutfit {
  userId: string;
  outfitId: string;
  plannedFor: Date | null;
}

/** Campos parciales para actualizar el planeado activo (sólo los presentes se modifican). */
export interface PlannedOutfitUpdate {
  outfitId?: string;
  plannedFor?: Date | null;
}

/**
 * Contrato del repositorio de planeados. Lo define `application` (no conoce Prisma); lo
 * implementa `infrastructure/persistence`. Tipos en entidades de dominio, nunca modelos Prisma.
 */
export interface PlannedOutfitRepository {
  /** El único planeado activo (status ≠ cancelled) del usuario, o null. */
  findActive(userId: string): Promise<PlannedOutfit | null>;

  /**
   * Fija un nuevo próximo outfit CANCELANDO atómicamente el activo anterior (invariante de
   * "un solo activo"). Devuelve el recién creado (status=planned).
   */
  create(data: NewPlannedOutfit): Promise<PlannedOutfit>;

  /** Actualiza campos del planeado activo por id (pertenencia ya verificada por el use-case). */
  update(id: string, data: PlannedOutfitUpdate): Promise<PlannedOutfit>;

  /** Marca el planeado activo como `confirmed` (HU-05) y lo devuelve. */
  confirm(id: string): Promise<PlannedOutfit>;

  /** Quita (cancela) el planeado activo del usuario. Idempotente a nivel fila. */
  cancelActive(userId: string): Promise<void>;
}

export const PLANNED_OUTFIT_REPOSITORY = Symbol('PlannedOutfitRepository');
