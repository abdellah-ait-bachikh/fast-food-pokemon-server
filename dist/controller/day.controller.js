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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteDay = exports.stopDay = exports.createDay = exports.getDayShow = exports.getLatestDay = exports.getDaysWithPaymentsCounts = void 0;
const utils_1 = require("../lib/utils");
const db_1 = __importDefault(require("../lib/db"));
exports.getDaysWithPaymentsCounts = (0, utils_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { rowsPerPage = "all", startAt, page } = req.query;
    let from;
    let fromEnd;
    if (startAt && !isNaN(new Date(startAt).getTime())) {
        const parsedDate = new Date(startAt);
        from = new Date(parsedDate.getFullYear(), parsedDate.getMonth(), parsedDate.getDate());
        fromEnd = new Date(parsedDate.getFullYear(), parsedDate.getMonth(), parsedDate.getDate() + 1);
    }
    const take = rowsPerPage
        ? isNaN(parseInt(rowsPerPage))
            ? undefined
            : parseInt(rowsPerPage)
        : undefined;
    const currentPage = !isNaN(parseInt(page))
        ? parseInt(page)
        : 1;
    const skip = take ? (currentPage - 1) * take : undefined;
    // Count total days for pagination (use same where filter if needed)
    const total = yield db_1.default.day.count({
        where: from ? { startAt: { gte: from, lt: fromEnd } } : {},
    });
    const days = yield db_1.default.day.findMany({
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
        const { paymentsOffers, paymentsProducts } = item, rest = __rest(item, ["paymentsOffers", "paymentsProducts"]);
        // Calculate the total money excluding delivery price
        const totalMoneyWithoutDelivery = paymentsOffers.reduce((sum, offer) => sum + (offer.totalePrice || 0), 0) +
            paymentsProducts.reduce((sum, product) => sum + (product.totalePrice || 0), 0);
        // Calculate the total delivery price
        const totalDeliveryPrice = paymentsOffers.reduce((sum, offer) => sum + (offer.delevryPrice || 0), 0) +
            paymentsProducts.reduce((sum, product) => sum + (product.delevryPrice || 0), 0);
        return Object.assign(Object.assign({}, rest), { _count: {
                payments: item.paymentsOffers.length + item.paymentsProducts.length,
                paymentsProducts: item.paymentsProducts.length,
                paymentsOffers: item.paymentsOffers.length,
            }, totalMoneyWithoutDelivery,
            totalDeliveryPrice });
    });
    res.status(200).json({
        days: formatedDays,
        pagination: {
            total,
            currentPage,
            rowsPerPage: take !== null && take !== void 0 ? take : total,
            totalPages: take ? Math.ceil(total / take) : 1,
        },
    });
}));
exports.getLatestDay = (0, utils_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const latestDay = yield db_1.default.day.findFirst({ orderBy: { startAt: "desc" } });
    if (!latestDay) {
        res.status(404).json({ message: "Aucune journée trouvée." });
        return;
    }
    res.status(200).json(latestDay);
}));
exports.getDayShow = (0, utils_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const dayId = parseInt(id);
    if (isNaN(dayId)) {
        res.status(400).json({ message: "ID  invalide." });
        return;
    }
    const day = yield db_1.default.day.findUnique({
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
                            offer: { select: { id: true, name: true, price: true, imageUri: true } },
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
                                    id: true,
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
    const deleverys = yield db_1.default.user.findMany({
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
    const deliveryEarnings = yield Promise.all(deleverys.map((delevry) => __awaiter(void 0, void 0, void 0, function* () {
        var _a, _b, _c, _d;
        // Sum total prices of products delivered
        const totalProducts = yield db_1.default.paymentProduct.aggregate({
            where: { delevryId: delevry.id, dayId },
            _sum: {
                totalePrice: true,
                delevryPrice: true,
            },
        });
        // Sum total prices of offers delivered
        const totalOffers = yield db_1.default.paymentOffer.aggregate({
            where: { delevryId: delevry.id, dayId },
            _sum: {
                totalePrice: true,
                delevryPrice: true,
            },
        });
        return Object.assign(Object.assign({}, delevry), { totalEarnings: ((_a = totalProducts._sum.totalePrice) !== null && _a !== void 0 ? _a : 0) +
                ((_b = totalOffers._sum.totalePrice) !== null && _b !== void 0 ? _b : 0), totalDeleveryPrice: ((_c = totalProducts._sum.delevryPrice) !== null && _c !== void 0 ? _c : 0) +
                ((_d = totalOffers._sum.delevryPrice) !== null && _d !== void 0 ? _d : 0) });
    })));
    const productDetails = yield db_1.default.paymentProductDetail.findMany({
        where: { payment: { dayId } },
        include: {
            product: {
                select: { name: true, category: { select: { name: true } } },
            },
        },
    });
    const offerDetails = yield db_1.default.paymentOfferDetail.findMany({
        where: { payment: { dayId } },
        include: {
            offer: {
                select: { name: true },
            },
        },
    });
    const productChartData = productDetails.reduce((acc, item) => {
        var _a, _b;
        const label = `${item.product.name} ${(_b = (_a = item.product.category) === null || _a === void 0 ? void 0 : _a.name) !== null && _b !== void 0 ? _b : ""}`;
        if (!acc[label])
            acc[label] = 0;
        acc[label] += item.quantity;
        return acc;
    }, {});
    const offerChartData = offerDetails.reduce((acc, item) => {
        const label = item.offer.name;
        if (!acc[label])
            acc[label] = 0;
        acc[label] += item.quantity;
        return acc;
    }, {});
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
    day.paymentsProducts.flatMap((p) => p.detailsProducts.forEach((detail) => {
        var _a, _b;
        if (productMap.has(detail.product.id)) {
            productMap.get(detail.product.id).quantity += detail.quantity;
        }
        else {
            productMap.set(detail.product.id, {
                id: detail.product.id,
                name: detail.product.name,
                quantity: detail.quantity,
                category: {
                    name: (_b = (_a = detail.product.category) === null || _a === void 0 ? void 0 : _a.name) !== null && _b !== void 0 ? _b : "Unknown",
                },
            });
        }
    }));
    const products = Array.from(productMap.values()).sort((a, b) => b.quantity - a.quantity);
    // Aggregate Offers
    const offerMap = new Map();
    day.paymentsOffers.flatMap((o) => o.detailsOffer.forEach((detail) => {
        if (offerMap.has(detail.offer.id)) {
            offerMap.get(detail.offer.id).quantity += detail.quantity;
        }
        else {
            offerMap.set(detail.offer.id, {
                id: detail.offer.id,
                name: detail.offer.name,
                quantity: detail.quantity,
            });
        }
    }));
    const offers = Array.from(offerMap.values()).sort((a, b) => b.quantity - a.quantity);
    res.status(200).json(Object.assign(Object.assign({}, day), { deleverys: deliveryEarnings, shart, products, offers }));
}));
exports.createDay = (0, utils_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const latestDay = yield db_1.default.day.findFirst({
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
    const newDay = yield db_1.default.day.create({
        data: {
            startAt: new Date(),
        },
    });
    res
        .status(201)
        .json({ message: "La journée a démarré avec succès.", day: newDay });
}));
exports.stopDay = (0, utils_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const dayId = parseInt(id);
    if (isNaN(dayId)) {
        res.status(400).json({ message: "ID  invalide." });
        return;
    }
    const latestDay = yield db_1.default.day.findUnique({
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
    const stoppedDay = yield db_1.default.day.update({
        where: { id: latestDay.id },
        data: { stopAt: new Date() },
    });
    res.status(200).json({
        message: "Journée clôturée avec succès.",
        day: stoppedDay,
    });
}));
exports.deleteDay = (0, utils_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const exist = yield db_1.default.day.findUnique({
        where: {
            id: parseInt(id),
        },
    });
    if (!exist) {
        res.status(404).json({ message: "Aucune journée trouvée." });
        return;
    }
    yield db_1.default.day.delete({
        where: {
            id: parseInt(id),
        },
    });
    res.status(200).json({ message: "Journée supprimée avec succès." });
}));
