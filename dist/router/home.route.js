"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const home_controller_1 = require("../controller/home.controller");
const homeRouter = (0, express_1.Router)();
homeRouter.get("/payments-status", home_controller_1.getPaymentsSatus);
homeRouter.get("/top-ranking-products", home_controller_1.getTopRankingProducts);
homeRouter.get("/top-ranking-offers", home_controller_1.getTopRankingOffers);
homeRouter.get("/top-ranking-deleverys", home_controller_1.getDeleveryStatus);
homeRouter.get("/mountly-payments", home_controller_1.getMonthlyPaymentStats);
exports.default = homeRouter;
