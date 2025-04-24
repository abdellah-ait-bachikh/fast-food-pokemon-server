import { PrismaClient } from '@prisma/client';
const db = new PrismaClient();

async function main() {
  // Clear existing data
  await db.paymentProductDetail.deleteMany();
  await db.paymentProduct.deleteMany();
  await db.product.deleteMany();
  await db.category.deleteMany();
  await db.user.deleteMany();
  await db.day.deleteMany();

  // Seed categories
  await db.category.createMany({
    data: [
      { name: 'Boissons', position: 1, imageFile: 'boissons.jpg' },
      { name: 'Snacks', position: 2, imageFile: 'snacks.jpg' },
      { name: 'Paninis', position: 3, imageFile: 'paninis.jpg' },
    ],
  });

  const boissons = await db.category.findUnique({ where: { name: 'Boissons' } });
  const snacks = await db.category.findUnique({ where: { name: 'Snacks' } });
  const paninis = await db.category.findUnique({ where: { name: 'Paninis' } });

  // Seed products
  await db.product.createMany({
    data: [
      {
        name: 'Coca-Cola 33cl',
        price: 8,
        categoryId: boissons?.id,
        type: 'CHARBON',
        position: 1,
      },
      {
        name: 'Fanta Orange 33cl',
        price: 8,
        categoryId: boissons?.id,
        type: 'CHARBON',
        position: 2,
      },
      {
        name: 'Chips Lays Fromage',
        price: 5,
        categoryId: snacks?.id,
        type: 'FOUR',
        position: 1,
      },
      {
        name: 'Chocolat Kinder',
        price: 6,
        categoryId: snacks?.id,
        type: 'FOUR',
        position: 2,
      },
      {
        name: 'Panini Poulet Fromage',
        price: 20,
        categoryId: paninis?.id,
        type: 'PANINI',
        position: 1,
      },
      {
        name: 'Panini Thon Olive',
        price: 20,
        categoryId: paninis?.id,
        type: 'PANINI',
        position: 2,
      },
    ],
  });

  // Seed one delivery user
  const livreur = await db.user.create({
    data: {
      userName: 'livreur1',
      password: 'hashedpassword123',
      phone: '0600000000',
      role: 'LIVREUR',
    },
  });

  // Seed one day
  const day = await db.day.create({
    data: {
      startAt: new Date(),
    },
  });

  // Fetch products
  const products = await db.product.findMany();

  // Seed 4 payments
  for (let i = 1; i <= 4; i++) {
    const details = products.slice(0, 3).map((product, idx) => {
      const quantity = (i + idx) % 4 + 1; // quantity 1-4
      return {
        productId: product.id,
        quantity,
        totalePrice: quantity * product.price,
      };
    });

    const totalePrice = details.reduce((acc, d) => acc + d.totalePrice, 0);
 const delevryPrice = 5
    await db.paymentProduct.create({
      data: {
        dailyNumber: i,
        totalePrice:totalePrice+delevryPrice,
        isPayed: true,
        delevryPrice,
        clientPhoneNumber: `061234567${i}`,
        delevryId: livreur.id,
        dayId: day.id,
        detailsProducts: {
          create: details,
        },
      },
    });
  }

  console.log('✅ Seed completed with categories, products, and payments!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
