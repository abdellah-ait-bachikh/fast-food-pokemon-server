"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDeleveryStatus = exports.getTopRankingOffers = exports.getTopRankingProducts = exports.getPaymentsSatus = void 0;
const utils_1 = require("../lib/utils");
const db_1 = __importDefault(require("../lib/db"));
exports.getPaymentsSatus = (0, utils_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const paymentProducts = yield db_1.default.paymentProduct.count();
    const paymentOffers = yield db_1.default.paymentOffer.count();
    const totalPayments = paymentProducts + paymentOffers;
    const normalProductPayment = yield db_1.default.paymentProduct.count({
        where: {
            delevryId: null,
        },
    });
    const normalOfferPayment = yield db_1.default.paymentOffer.count({
        where: {
            delevryId: null,
        },
    });
    const totalNormalPayments = normalProductPayment + normalOfferPayment;
    const deliveredProductPayment = yield db_1.default.paymentProduct.count({
        where: {
            delevryId: { not: null },
        },
    });
    const deliveredOfferPayment = yield db_1.default.paymentOffer.count({
        where: {
            delevryId: { not: null },
        },
    });
    const totalDelevredPayments = deliveredProductPayment + deliveredOfferPayment;
    const totalProductPaymentsMoney = yield db_1.default.paymentProduct.aggregate({
        _sum: { totalePrice: true },
    });
    const totalOfferPaymentsMoney = yield db_1.default.paymentOffer.aggregate({
        _sum: {
            totalePrice: true,
        },
    });
    const totalMoney = (totalProductPaymentsMoney._sum.totalePrice || 0) +
        (totalOfferPaymentsMoney._sum.totalePrice || 0);
    res.status(200).json({
        totalPayments,
        totalNormalPayments,
        totalDelevredPayments,
        totalMoney,
    });
}));
exports.getTopRankingProducts = (0, utils_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const topProductsByQuantity = yield db_1.default.paymentProductDetail.groupBy({
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
    const rankingProducts = yield Promise.all(topProductsByQuantity.map((item) => __awaiter(void 0, void 0, void 0, function* () {
        const product = yield db_1.default.product.findUnique({
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
        return Object.assign(Object.assign({ id: item.productId }, product), { quantity: item._sum.quantity || 0 });
    })));
    res.status(200).json(rankingProducts);
}));
exports.getTopRankingOffers = (0, utils_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const topOfferByQuantity = yield db_1.default.paymentOfferDetail.groupBy({
        by: ["offerId"],
        _sum: {
            quantity: true,
        },
        orderBy: {
            _sum: { quantity: "desc" },
        },
    });
    const topOffers = yield Promise.all(topOfferByQuantity.map((item) => __awaiter(void 0, void 0, void 0, function* () {
        const offer = yield db_1.default.offer.findUnique({
            where: {
                id: item.offerId,
            },
            select: {
                name: true,
                createdAt: true,
                imageFile: true,
            },
        });
        return Object.assign(Object.assign({ id: item.offerId }, offer), { quantity: item._sum.quantity });
    })));
    res.status(200).json(topOffers);
}));
exports.getDeleveryStatus = (0, utils_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const deleverys = yield db_1.default.user.findMany({
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
    const totlaeMoneyInPaymentsProducts = yield Promise.all(deleverys.map((item) => __awaiter(void 0, void 0, void 0, function* () {
        const paymentsProducts = yield db_1.default.paymentProduct.aggregate({
            where: {
                delevryId: item.id,
            },
            _sum: {
                delevryPrice: true,
            },
        });
        const paymentsOffers = yield db_1.default.paymentOffer.aggregate({
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
            totalPayments: (item._count.ordersProducts || 0) + (item._count.ordersOffers || 0),
            totaleMoney: (paymentsOffers._sum.delevryPrice || 0) +
                (paymentsProducts._sum.delevryPrice || 0),
        };
    })));
    res.status(200).json(totlaeMoneyInPaymentsProducts);
    // const deleverysStatus = await Promise.all(
    //   deleverys.map(async (item) => {
    //     const statusDelevery = awaitdb.pay;
    //   })
    // );
}));
