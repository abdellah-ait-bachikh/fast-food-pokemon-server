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
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const db = new client_1.PrismaClient();
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        yield db.paymentProductDetail.deleteMany();
        yield db.paymentProduct.deleteMany();
        yield db.product.deleteMany();
        yield db.category.deleteMany();
        yield db.user.deleteMany();
        yield db.day.deleteMany();
        yield db.category.createMany({
            data: [
                { name: "Boissons", position: 1 },
                { name: "Snacks", position: 2 },
                { name: "Paninis", position: 3 },
            ],
        });
        const boissons = yield db.category.findUnique({
            where: { name: "Boissons" },
        });
        const snacks = yield db.category.findUnique({ where: { name: "Snacks" } });
        const paninis = yield db.category.findUnique({ where: { name: "Paninis" } });
        yield db.product.createMany({
            data: [
                {
                    name: "Coca-Cola 33cl",
                    price: 8,
                    categoryId: boissons === null || boissons === void 0 ? void 0 : boissons.id,
                    type: "CHARBON",
                    position: 1,
                },
                {
                    name: "Fanta Orange 33cl",
                    price: 8,
                    categoryId: boissons === null || boissons === void 0 ? void 0 : boissons.id,
                    type: "CHARBON",
                    position: 2,
                },
                {
                    name: "Chips Lays Fromage",
                    price: 5,
                    categoryId: snacks === null || snacks === void 0 ? void 0 : snacks.id,
                    type: "FOUR",
                    position: 1,
                },
                {
                    name: "Chocolat Kinder",
                    price: 6,
                    categoryId: snacks === null || snacks === void 0 ? void 0 : snacks.id,
                    type: "FOUR",
                    position: 2,
                },
                {
                    name: "Panini Poulet Fromage",
                    price: 20,
                    categoryId: paninis === null || paninis === void 0 ? void 0 : paninis.id,
                    type: "PANINI",
                    position: 1,
                },
                {
                    name: "Panini Thon Olive",
                    price: 20,
                    categoryId: paninis === null || paninis === void 0 ? void 0 : paninis.id,
                    type: "PANINI",
                    position: 2,
                },
            ],
        });
        const livreur = yield db.user.create({
            data: {
                userName: "livreur1",
                password: "hashedpassword123",
                phone: "0600000000",
                role: "LIVREUR",
            },
        });
        const day = yield db.day.create({
            data: {
                startAt: new Date(),
            },
        });
        const products = yield db.product.findMany();
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
            yield db.paymentProduct.create({
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
        console.log("✅ Seed completed with categories, products, and payments!");
    });
}
main()
    .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
})
    .finally(() => __awaiter(void 0, void 0, void 0, function* () {
    yield db.$disconnect();
}));
