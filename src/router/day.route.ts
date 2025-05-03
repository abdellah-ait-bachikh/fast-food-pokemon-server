import { Router } from "express";
import {
  deleteDay,
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

dayRouter.delete("/:id", deleteDay);

export default dayRouter;
