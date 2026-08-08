import { User } from '../../domain/entities/user.entity';

/** Campos editables del perfil (sólo los presentes se modifican). */
export interface UserUpdate {
  name?: string;
  photoUrl?: string | null;
}

/** Identidad que devuelve Google tras un login exitoso. */
export interface GoogleIdentity {
  googleId: string;
  email: string;
  name: string;
  photoUrl: string | null;
}

/**
 * Contrato del repositorio de usuarios. Lo define `application` (no conoce Prisma); lo
 * implementa `infrastructure/persistence`.
 */
export interface UserRepository {
  findById(id: string): Promise<User | null>;
  update(id: string, data: UserUpdate): Promise<User>;
  findByGoogleId(googleId: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  /** Vincula una identidad de Google a un usuario que ya existía (match por email). */
  linkGoogleId(id: string, identity: GoogleIdentity): Promise<User>;
  createFromGoogle(identity: GoogleIdentity): Promise<User>;
}

export const USER_REPOSITORY = Symbol('UserRepository');
