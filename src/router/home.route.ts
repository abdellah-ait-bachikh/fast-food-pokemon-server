import { Request, Response, Router } from "express";
import {
  getDeleveryStatus,
  getPaymentsSatus,
  getTopRankingOffers,
  getTopRankingProducts,
} from "../controller/home.controller";
const homeRouter = Router();

homeRouter.get("/payments-status", getPaymentsSatus);
homeRouter.get("/top-ranking-products", getTopRankingProducts);
homeRouter.get("/top-ranking-offers", getTopRankingOffers);
homeRouter.get("/top-ranking-deleverys", getDeleveryStatus);

export default homeRouter;
