import { Router } from "express";
import {
  deleteCtagory,
  getAllCategories,
  getCategoriesWithProduct,
  getCategoriesWithProductCount,
} from "../controller/category.controller";

const categoryRoutes = Router();
categoryRoutes.get("/", getCategoriesWithProductCount);
categoryRoutes.get("/withProducts", getCategoriesWithProduct);
categoryRoutes.get("/select", getAllCategories);

categoryRoutes.get("/:id", deleteCtagory);
export default categoryRoutes;
