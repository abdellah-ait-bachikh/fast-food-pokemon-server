import { Router } from "express";
import {
  createCategory,
  deleteCtagory,
  getAllCategories,
  getCategoriesWithProduct,
  getCategoriesWithProductCount,
  getCategory,
  getShowCategory,
} from "../controller/category.controller";

const categoryRoutes = Router();

//GET
categoryRoutes.get("/productsCount", getCategoriesWithProductCount);
categoryRoutes.get("/withProducts", getCategoriesWithProduct);
categoryRoutes.get("/select", getAllCategories);
categoryRoutes.get("/:id", getCategory);
categoryRoutes.get("/show/:id", getShowCategory);

//POST
categoryRoutes.post("/", createCategory);

//Put
categoryRoutes.put("/:id", createCategory);

//DELETE
categoryRoutes.delete("/:id", deleteCtagory);

export default categoryRoutes;
