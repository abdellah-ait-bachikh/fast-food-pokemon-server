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
                imageFile: true,
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
    res.status(200).json(rankingProducts);
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
            imageFile: true,
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
      where:{
        role:'LIVREUR'
      },
    })

    const deleverysStatus = await Promise.all(
      deleverys.map(async(item)=>{
// const statusDelevery = await db.pay
      })
    )
  }
);
