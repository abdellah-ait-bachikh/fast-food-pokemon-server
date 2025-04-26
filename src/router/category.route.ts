import { Router } from "express";
import {
  deleteCtagory,
  getAllCategories,
  getCategoriesWithProductCount,
} from "../controller/category.controller";

const categoryRoutes = Router();
categoryRoutes.get("/", getCategoriesWithProductCount);
categoryRoutes.get("/select", getAllCategories);

categoryRoutes.get("/:id", deleteCtagory);
export default categoryRoutes;
