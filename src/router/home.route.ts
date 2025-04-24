import { Request, Response, Router } from "express";
import {
  getPaymentsSatus,
  getTopRankingProducts,
} from "../controller/home.controller";
const homeRouter = Router();

homeRouter.get("/payments-status", getPaymentsSatus);
homeRouter.get("/top-ranking-products", getTopRankingProducts);

export default homeRouter;
