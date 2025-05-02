import { Router } from "express";
import {
    getDayShow,
  getDaysWithPaymentsCounts,
  getLatestDay,
  stopDay,
} from "../controller/day.controller";
const dayRouter = Router();
dayRouter.get("/count-payments", getDaysWithPaymentsCounts);
dayRouter.get("/latest", getLatestDay);
dayRouter.get("/show/:id", getDayShow);

dayRouter.put("/stop/:id", stopDay);

export default dayRouter;
