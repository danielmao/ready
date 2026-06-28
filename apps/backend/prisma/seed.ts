/**
 * Seed reproducible del MVP (single-user). Idempotente: usa `upsert` por claves naturales,
 * así correrlo varias veces no duplica filas.
 *
 *   npm run seed
 *
 * El `userId` fijo debe coincidir con el que inyecta el guard @CurrentUser
 * (src/shared/auth). Se controla con la env MVP_USER_ID (mismo default en ambos lados).
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const MVP_USER_ID =
  process.env.MVP_USER_ID ?? '00000000-0000-0000-0000-000000000001';

async function main(): Promise<void> {
  // 1) Usuario único del MVP.
  await prisma.user.upsert({
    where: { id: MVP_USER_ID },
    update: {},
    create: {
      id: MVP_USER_ID,
      email: 'mvp@ready.app',
      name: 'Ready MVP User',
    },
  });

  // 2) Categorías base (con una jerarquía simple: calzado → zapatillas).
  const categories = [
    { name: 'Camiseta', icon: '👕' },
    { name: 'Pantalón', icon: '👖' },
    { name: 'Vestido', icon: '👗' },
    { name: 'Abrigo', icon: '🧥' },
    { name: 'Calzado', icon: '👟' },
    { name: 'Accesorio', icon: '🧢' },
  ];
  for (const c of categories) {
    await prisma.category.upsert({
      where: { name: c.name },
      update: { icon: c.icon },
      create: c,
    });
  }

  // 3) Colores base con hexCode.
  const colors = [
    { name: 'Negro', hexCode: '#000000' },
    { name: 'Blanco', hexCode: '#FFFFFF' },
    { name: 'Gris', hexCode: '#808080' },
    { name: 'Azul', hexCode: '#1E3A8A' },
    { name: 'Rojo', hexCode: '#DC2626' },
    { name: 'Verde', hexCode: '#16A34A' },
    { name: 'Beige', hexCode: '#D6C7A1' },
  ];
  for (const c of colors) {
    await prisma.color.upsert({
      where: { name: c.name },
      update: { hexCode: c.hexCode },
      create: c,
    });
  }

  // 4) Occasions globales (catálogo). Sin userId → compartidas.
  const occasions = [
    { name: 'Trabajo', icon: '💼' },
    { name: 'Casual', icon: '🙂' },
    { name: 'Formal', icon: '🎩' },
    { name: 'Deporte', icon: '🏃' },
    { name: 'Fiesta', icon: '🎉' },
  ];
  for (const o of occasions) {
    // Occasion no tiene unique en `name`; buscamos la global existente por nombre.
    const existing = await prisma.occasion.findFirst({
      where: { name: o.name, isGlobal: true },
    });
    if (existing) {
      await prisma.occasion.update({
        where: { id: existing.id },
        data: { icon: o.icon },
      });
    } else {
      await prisma.occasion.create({
        data: { name: o.name, icon: o.icon, isGlobal: true },
      });
    }
  }

  // eslint-disable-next-line no-console
  console.log('Seed OK: user fijo + categorías + colores + occasions globales.');
}

main()
  .catch((e) => {
    // eslint-disable-next-line no-console
    console.error(e);
    process.exit(1);
  })
  .finally(() => {
    void prisma.$disconnect();
  });
