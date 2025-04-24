import { Request, Response, Router } from "express";
import {
  getPaymentsSatus,
  getTopRankingOffers,
  getTopRankingProducts,
} from "../controller/home.controller";
const homeRouter = Router();

homeRouter.get("/payments-status", getPaymentsSatus);
homeRouter.get("/top-ranking-products", getTopRankingProducts);
homeRouter.get("/top-ranking-offers", getTopRankingOffers);

export default homeRouter;
