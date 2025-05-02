import { Router } from "express";
import {
    getDayShow,
  getDaysWithPaymentsCounts,
  getLatestDay,
} from "../controller/day.controller";
const dayRouter = Router();
dayRouter.get("/count-payments", getDaysWithPaymentsCounts);
dayRouter.get("/latest", getLatestDay);
dayRouter.get("/show/:id", getDayShow);
export default dayRouter;
