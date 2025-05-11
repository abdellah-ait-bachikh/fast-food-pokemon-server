import { Request, Response } from "express";
import { asyncHandler } from "../lib/utils";
import db from "../lib/db";

export const getDaysWithPaymentsCounts = asyncHandler(
  async (req: Request, res: Response) => {
    const { rowsPerPage = "all", startAt, page } = req.query;
    let from: Date | undefined;
    let fromEnd: Date | undefined;

    if (startAt && !isNaN(new Date(startAt as string).getTime())) {
      const parsedDate = new Date(startAt as string);
      from = new Date(
        parsedDate.getFullYear(),
        parsedDate.getMonth(),
        parsedDate.getDate()
      );
      fromEnd = new Date(
        parsedDate.getFullYear(),
        parsedDate.getMonth(),
        parsedDate.getDate() + 1
      );
    }
    const take = rowsPerPage
      ? isNaN(parseInt(rowsPerPage as string))
        ? undefined
        : parseInt(rowsPerPage as string)
      : undefined;

    const currentPage = !isNaN(parseInt(page as string))
      ? parseInt(page as string)
      : 1;

    const skip = take ? (currentPage - 1) * take : undefined;

    // Count total days for pagination (use same where filter if needed)
    const total = await db.day.count({
      where: from ? { startAt: { gte: from, lt: fromEnd } } : {},
    });
    const days = await db.day.findMany({
      where: from ? { startAt: { gte: from, lt: fromEnd } } : {},
      include: {
        paymentsOffers: {
          select: { id: true, totalePrice: true, delevryPrice: true },
        },
        paymentsProducts: {
          select: {
            id: true,
            totalePrice: true,
            delevryPrice: true,
          },
        },
      },
      orderBy: {
        startAt: "desc",
      },
      take,
      skip,
    });
    // Format the days with payment counts and money totals
    const formatedDays = days.map((item) => {
      const { paymentsOffers, paymentsProducts, ...rest } = item;

      // Calculate the total money excluding delivery price
      const totalMoneyWithoutDelivery =
        paymentsOffers.reduce(
          (sum, offer) => sum + (offer.totalePrice || 0),
          0
        ) +
        paymentsProducts.reduce(
          (sum, product) => sum + (product.totalePrice || 0),
          0
        );

      // Calculate the total delivery price
      const totalDeliveryPrice =
        paymentsOffers.reduce(
          (sum, offer) => sum + (offer.delevryPrice || 0),
          0
        ) +
        paymentsProducts.reduce(
          (sum, product) => sum + (product.delevryPrice || 0),
          0
        );

      return {
        ...rest,
        _count: {
          payments: item.paymentsOffers.length + item.paymentsProducts.length,
          paymentsProducts: item.paymentsProducts.length,
          paymentsOffers: item.paymentsOffers.length,
        },
        totalMoneyWithoutDelivery,
        totalDeliveryPrice,
      };
    });
    res.status(200).json({
      days: formatedDays,
      pagination: {
        total,
        currentPage,
        rowsPerPage: take ?? total,
        totalPages: take ? Math.ceil(total / take) : 1,
      },
    });
  }
);

export const getLatestDay = asyncHandler(
  async (req: Request, res: Response) => {
    const latestDay = await db.day.findFirst({ orderBy: { startAt: "desc" } });
    if (!latestDay) {
      res.status(404).json({ message: "Aucune journée trouvée." });
      return;
    }
    res.status(200).json(latestDay);
  }
);

export const getDayShow = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const dayId = parseInt(id);
  if (isNaN(dayId)) {
    res.status(400).json({ message: "ID  invalide." });
    return;
  }
  const day = await db.day.findUnique({
    where: { id: parseInt(id) },
    include: {
      paymentsOffers: {
        include: {
          delevry: {
            select: { userName: true },
          },
          detailsOffer: {
            select: {
              id: true,
              quantity: true,
              offer: { select: {id:true, name: true, price: true, imageUri: true } },
              totalePrice: true,
            },
          },
        },
      },
      paymentsProducts: {
        include: {
          delevry: {
            select: {
              userName: true,
            },
          },
          detailsProducts: {
            select: {
              id: true,
              quantity: true,
              product: {
                select: {
                  id:true,
                  name: true,
                  price: true,
                  category: {
                    select: { name: true, imageUri: true },
                  },
                },
              },
              totalePrice: true,
            },
          },
        },
      },
    },
  });
  if (!day) {
    res.status(404).json({ message: "Aucune journée trouvée." });
    return;
  }
  const deleverys = await db.user.findMany({
    where: {
      OR: [
        { ordersOffers: { some: { dayId: day.id } } },
        { ordersProducts: { some: { dayId: day.id } } },
      ],
    },
    select: {
      id: true,
      role: true,
      userName: true,
      phone: true,
      _count: {
        select: {
          ordersOffers: true,
          ordersProducts: true,
        },
      },
    },
  });
  const deliveryEarnings = await Promise.all(
    deleverys.map(async (delevry) => {
      // Sum total prices of products delivered
      const totalProducts = await db.paymentProduct.aggregate({
        where: { delevryId: delevry.id, dayId },
        _sum: {
          totalePrice: true,
          delevryPrice: true,
        },
      });

      // Sum total prices of offers delivered
      const totalOffers = await db.paymentOffer.aggregate({
        where: { delevryId: delevry.id, dayId },
        _sum: {
          totalePrice: true,
          delevryPrice: true,
        },
      });

      return {
        ...delevry,
        totalEarnings:
          (totalProducts._sum.totalePrice ?? 0) +
          (totalOffers._sum.totalePrice ?? 0),
        totalDeleveryPrice:
          (totalProducts._sum.delevryPrice ?? 0) +
          (totalOffers._sum.delevryPrice ?? 0),
      };
    })
  );
  const productDetails = await db.paymentProductDetail.findMany({
    where: { payment: { dayId } },
    include: {
      product: {
        select: { name: true, category: { select: { name: true } } },
      },
    },
  });

  const offerDetails = await db.paymentOfferDetail.findMany({
    where: { payment: { dayId } },
    include: {
      offer: {
        select: { name: true },
      },
    },
  });

  const productChartData = productDetails.reduce((acc, item) => {
    const label = `${item.product.name} ${item.product.category?.name ?? ""}`;
    if (!acc[label]) acc[label] = 0;
    acc[label] += item.quantity;
    return acc;
  }, {} as Record<string, number>);

  const offerChartData = offerDetails.reduce((acc, item) => {
    const label = item.offer.name;
    if (!acc[label]) acc[label] = 0;
    acc[label] += item.quantity;
    return acc;
  }, {} as Record<string, number>);

  const shart = {
    products: {
      labels: Object.keys(productChartData),
      series: Object.values(productChartData),
    },
    offers: {
      labels: Object.keys(offerChartData),
      series: Object.values(offerChartData),
    },
  };
   // Aggregate Products
  const productMap = new Map();
  day.paymentsProducts.flatMap((p) =>
    p.detailsProducts.forEach((detail) => {
      if (productMap.has(detail.product.id)) {
        productMap.get(detail.product.id).quantity += detail.quantity;
      } else {
        productMap.set(detail.product.id, {
          id: detail.product.id,
          name: detail.product.name,
          quantity: detail.quantity,
          category: {
            name: detail.product.category?.name ?? "Unknown",
          },
        });
      }
    })
  );
  const products = Array.from(productMap.values());

  // Aggregate Offers
  const offerMap = new Map();
  day.paymentsOffers.flatMap((o) =>
    o.detailsOffer.forEach((detail) => {
      if (offerMap.has(detail.offer.id)) {
        offerMap.get(detail.offer.id).quantity += detail.quantity;
      } else {
        offerMap.set(detail.offer.id, {
          id: detail.offer.id,
          name: detail.offer.name,
          quantity: detail.quantity,
        });
      }
    })
  );
  const offers = Array.from(offerMap.values());

  res.status(200).json({ ...day, deleverys: deliveryEarnings, shart,products,offers });
});

export const createDay = asyncHandler(
  async (req: Request<{}, {}, {}>, res: Response) => {
    const latestDay = await db.day.findFirst({
      orderBy: {
        startAt: "desc",
      },
    });
    if (latestDay && latestDay.stopAt === null) {
      res
        .status(400)
        .json({ message: "Vous devez d'abord clôturer la dernière journée." });
      return;
    }
    const newDay = await db.day.create({
      data: {
        startAt: new Date(),
      },
    });
    res
      .status(201)
      .json({ message: "La journée a démarré avec succès.", day: newDay });
  }
);

export const stopDay = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const dayId = parseInt(id);
  if (isNaN(dayId)) {
    res.status(400).json({ message: "ID  invalide." });
    return;
  }

  const latestDay = await db.day.findUnique({
    where: {
      id: parseInt(id),
    },
  });

  if (!latestDay) {
    res.status(400).json({ message: "Aucune journée trouvée à clôturer." });
    return;
  }

  if (latestDay.stopAt !== null) {
    res.status(400).json({
      message: "Cette journée est déjà clôturée.",
    });
    return;
  }

  const stoppedDay = await db.day.update({
    where: { id: latestDay.id },
    data: { stopAt: new Date() },
  });

  res.status(200).json({
    message: "Journée clôturée avec succès.",
    day: stoppedDay,
  });
});

export const deleteDay = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const exist = await db.day.findUnique({
    where: {
      id: parseInt(id),
    },
  });
  if (!exist) {
    res.status(404).json({ message: "Aucune journée trouvée." });
    return;
  }
  await db.day.delete({
    where: {
      id: parseInt(id),
    },
  });
  res.status(200).json({ message: "Journée supprimée avec succès." });
});
