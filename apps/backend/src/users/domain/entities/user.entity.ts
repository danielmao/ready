/**
 * User: el usuario de Ready. En el MVP hay uno solo (single-user, `userId` fijo vía guard).
 * Raíz del dominio `users`. Clase plana: sin framework ni Prisma.
 */
export class User {
  id!: string;
  email!: string;
  name!: string;
  photoUrl!: string | null;
  createdAt!: Date;
  updatedAt!: Date;

  constructor(data: Partial<User> = {}) {
    Object.assign(this, data);
  }
}
