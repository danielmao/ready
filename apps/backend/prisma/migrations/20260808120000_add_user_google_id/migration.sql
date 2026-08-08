-- AlterTable: identidad de Google del usuario (claim `sub` del id_token).
-- Nullable: los usuarios existentes (el sembrado del MVP) nacen sin ella y se vinculan
-- en su primer login por coincidencia de email.
ALTER TABLE "users" ADD COLUMN     "googleId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "users_googleId_key" ON "users"("googleId");
