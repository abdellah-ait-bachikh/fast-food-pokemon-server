import { PrismaClient } from "@prisma/client";
const db = new PrismaClient();

async function main() {
  await db.paymentOfferDetail.deleteMany();
  await db.paymentOffer.deleteMany();
  await db.paymentProductDetail.deleteMany();
  await db.paymentProduct.deleteMany();
  await db.offer.deleteMany();
  await db.product.deleteMany();
  await db.category.deleteMany();
  await db.user.deleteMany();
  await db.day.deleteMany();

  // Create Categories
  await db.category.createMany({
    data: [
      { name: "Boissons", position: 1 },
      { name: "Snacks", position: 2 },
      { name: "Paninis", position: 3 },
    ],
  });

  const boissons = await db.category.findUnique({ where: { name: "Boissons" } });
  const snacks = await db.category.findUnique({ where: { name: "Snacks" } });
  const paninis = await db.category.findUnique({ where: { name: "Paninis" } });

  // Create Products
  await db.product.createMany({
    data: [
      { name: "Coca-Cola 33cl", price: 8, categoryId: boissons?.id, type: "CHARBON", position: 1 },
      { name: "Fanta Orange 33cl", price: 8, categoryId: boissons?.id, type: "CHARBON", position: 2 },
      { name: "Chips Lays Fromage", price: 5, categoryId: snacks?.id, type: "FOUR", position: 1 },
      { name: "Chocolat Kinder", price: 6, categoryId: snacks?.id, type: "FOUR", position: 2 },
      { name: "Panini Poulet Fromage", price: 20, categoryId: paninis?.id, type: "PANINI", position: 1 },
      { name: "Panini Thon Olive", price: 20, categoryId: paninis?.id, type: "PANINI", position: 2 },
    ],
  });

  const products = await db.product.findMany();

  // Create Offers
  const offer1 = await db.offer.create({
    data: {
      name: "Lunch Combo",
      price: 50,
      products: {
        connect: [
          { id: products[0].id }, // Coca-Cola
          { id: products[2].id }, // Chips
          { id: products[4].id }, // Panini Poulet Fromage
        ],
      },
    },
  });

  const offer2 = await db.offer.create({
    data: {
      name: "Snack Pack",
      price: 30,
      products: {
        connect: [
          { id: products[1].id }, // Fanta Orange
          { id: products[3].id }, // Chocolat Kinder
        ],
      },
    },
  });

  // Create User (Delivery Person)
  const livreur = await db.user.create({
    data: {
      userName: "livreur1",
      password: "hashedpassword123",
      phone: "0600000000",
      role: "LIVREUR",
    },
  });

  // Create Day
  const day = await db.day.create({
    data: {
      startAt: new Date(),
    },
  });

  // Create Payment Products
  for (let i = 1; i <= 6; i++) {
    const details = products.slice(0, 3).map((product, idx) => {
      const quantity = ((i + idx) % 4) + 1;
      return {
        productId: product.id,
        quantity,
        totalePrice: quantity * product.price,
      };
    });

    const totalePrice = details.reduce((acc, d) => acc + d.totalePrice, 0);
    const delevryPrice = 5;
    await db.paymentProduct.create({
      data: {
        dailyNumber: i,
        totalePrice: totalePrice + delevryPrice,
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

  // Create Payment Offers
  for (let i = 1; i <= 3; i++) {
    const detailsOffer = [
      {
        offerId: offer1.id,
        quantity: 2,
        totalePrice: 100,
      },
      {
        offerId: offer2.id,
        quantity: 1,
        totalePrice: 30,
      },
    ];

    const totalePrice = detailsOffer.reduce((acc, d) => acc + d.totalePrice, 0);
    const delevryPrice = 10;

    await db.paymentOffer.create({
      data: {
        dailyNumber: i,
        totalePrice: totalePrice + delevryPrice,
        isPayed: true,
        delevryPrice,
        clientPhoneNumber: `070000000${i}`,
        delevryId: livreur.id,
        dayId: day.id,
        detailsOffer: {
          create: detailsOffer,
        },
      },
    });
  }

  console.log("✅ Seed completed with categories, products, payments, and offers!");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
