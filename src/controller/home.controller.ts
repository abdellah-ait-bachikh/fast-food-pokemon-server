import { Request, Response } from "express";
import { asyncHandler } from "../lib/utils";
import db from "../lib/db";

export const getPaymentsSatus = asyncHandler(
  async (req: Request, res: Response) => {
    const paymentProducts = await db.paymentProduct.count();
    const paymentOffers = await db.paymentOffer.count();
    const totalPayments = paymentProducts + paymentOffers;

    const normalProductPayment = await db.paymentProduct.count({
      where: {
        delevryId: null,
      },
    });
    const normalOfferPayment = await db.paymentOffer.count({
      where: {
        delevryId: null,
      },
    });
    const totalNormalPayments = normalProductPayment + normalOfferPayment;

    const deliveredProductPayment = await db.paymentProduct.count({
      where: {
        delevryId: { not: null },
      },
    });
    const deliveredOfferPayment = await db.paymentOffer.count({
      where: {
        delevryId: { not: null },
      },
    });
    const totalDelevredPayments =
      deliveredProductPayment + deliveredOfferPayment;

    const totalProductPaymentsMoney = await db.paymentProduct.aggregate({
      _sum: { totalePrice: true },
    });
    const totalOfferPaymentsMoney = await db.paymentOffer.aggregate({
      _sum: {
        totalePrice: true,
      },
    });
    const totalMoney =
      (totalProductPaymentsMoney._sum.totalePrice || 0) +
      (totalOfferPaymentsMoney._sum.totalePrice || 0);
    res.status(200).json({
      totalPayments,
      totalNormalPayments,
      totalDelevredPayments,
      totalMoney,
    });
  }
);

export const getTopRankingProducts = asyncHandler(
  async (req: Request, res: Response) => {
    const topProductsByQuantity = await db.paymentProductDetail.groupBy({
      by: ["productId"],
      _sum: {
        quantity: true,
      },
      orderBy: {
        _sum: {
          quantity: "desc",
        },
      },
      take: 10,
    });

    const rankingProducts = await Promise.all(
      topProductsByQuantity.map(async (item) => {
        const product = await db.product.findUnique({
          where: {
            id: item.productId,
          },
          select: {
            name: true,
            category: {
              select: {
                name: true,
                imageUri: true,
              },
            },
          },
        });
        return {
          id: item.productId,
          ...product,
          quantity: item._sum.quantity || 0,
        };
      })
    );
    res.status(200).json({
      rankingProducts,
      shart: {
        labels: rankingProducts.map((e) => `${e.name} ${e.category?.name}`),
        series: rankingProducts.map((e) => e.quantity),
      },
    });
  }
);

export const getTopRankingOffers = asyncHandler(
  async (req: Request, res: Response) => {
    const topOfferByQuantity = await db.paymentOfferDetail.groupBy({
      by: ["offerId"],
      _sum: {
        quantity: true,
      },
      orderBy: {
        _sum: { quantity: "desc" },
      },
    });
    const topOffers = await Promise.all(
      topOfferByQuantity.map(async (item) => {
        const offer = await db.offer.findUnique({
          where: {
            id: item.offerId,
          },
          select: {
            name: true,
            createdAt: true,
            imageUri: true,
          },
        });
        return { id: item.offerId, ...offer, quantity: item._sum.quantity };
      })
    );
    res.status(200).json(topOffers);
  }
);

export const getDeleveryStatus = asyncHandler(
  async (req: Request, res: Response) => {
    const deleverys = await db.user.findMany({
      where: {
        role: "LIVREUR",
      },
      select: {
        id: true,
        userName: true,
        createdAt: true,
        _count: {
          select: { ordersOffers: true, ordersProducts: true },
        },
      },
    });
    const totlaeMoneyInPaymentsProducts = await Promise.all(
      deleverys.map(async (item) => {
        const paymentsProducts = await db.paymentProduct.aggregate({
          where: {
            delevryId: item.id,
          },
          _sum: {
            delevryPrice: true,
          },
        });
        const paymentsOffers = await db.paymentOffer.aggregate({
          where: {
            delevryId: item.id,
          },
          _sum: {
            delevryPrice: true,
          },
        });
        return {
          id: item.id,
          useName: item.userName,
          createdAt: item.createdAt,
          totalPayments:
            (item._count.ordersProducts || 0) + (item._count.ordersOffers || 0),
          totaleMoney:
            (paymentsOffers._sum.delevryPrice || 0) +
            (paymentsProducts._sum.delevryPrice || 0),
        };
      })
    );
    res.status(200).json(totlaeMoneyInPaymentsProducts);
    // const deleverysStatus = await Promise.all(
    //   deleverys.map(async (item) => {
    //     const statusDelevery = awaitdb.pay;
    //   })
    // );
  }
);
