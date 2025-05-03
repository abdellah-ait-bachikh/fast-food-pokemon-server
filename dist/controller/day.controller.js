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
    const days = yield db_1.default.day.findMany({
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
        const { paymentsOffers, paymentsProducts } = item, rest = __rest(item, ["paymentsOffers", "paymentsProducts"]);
        return Object.assign(Object.assign({}, rest), { _count: {
                payments: item.paymentsOffers.length + item.paymentsProducts.length,
            } });
    });
    res.status(200).json(formatedDays);
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
    res.status(200).json(Object.assign(Object.assign({}, day), { deleverys }));
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
        data: stoppedDay,
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
