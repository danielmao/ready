import { User } from '../../domain/entities/user.entity';

/** Campos editables del perfil (sólo los presentes se modifican). */
export interface UserUpdate {
  name?: string;
  photoUrl?: string | null;
}

/**
 * Contrato del repositorio de usuarios. Lo define `application` (no conoce Prisma); lo
 * implementa `infrastructure/persistence`.
 */
export interface UserRepository {
  findById(id: string): Promise<User | null>;
  update(id: string, data: UserUpdate): Promise<User>;
}

export const USER_REPOSITORY = Symbol('UserRepository');
