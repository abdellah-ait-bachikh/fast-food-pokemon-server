import { Request, Response } from "express";
import { asyncHandler } from "../lib/utils";
import db from "../lib/db";

export const getDaysWithPaymentsCounts = asyncHandler(
  async (req: Request, res: Response) => {
    const days = await db.day.findMany({
      include: {
        paymentsOffers: { select: { id: true } },
        paymentsProducts: {
          select: {
            id: true,
          },
        },
      },
      orderBy: {
        startAt: "desc",
      },
    });
    const formatedDays = days.map((item) => {
      const { paymentsOffers, paymentsProducts, ...rest } = item;
      return {
        ...rest,
        _count: {
          payments: item.paymentsOffers.length + item.paymentsProducts.length,
        },
      };
    });
    res.status(200).json(formatedDays);
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
              offer: { select: { name: true, price: true, imageUri: true } },
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
  res.status(200).json({ ...day, deleverys });
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
    res.status(201).json({ message: "La journée a démarré avec succès." });
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
    data: stoppedDay,
  });
});
