import { Router } from "express";
import {
  createCategory,
  deleteCtagory,
  getAllCategories,
  getCategoriesWithProduct,
  getCategoriesWithProductCount,
  getCategory,
  getShowCategory,
  updateCategory,
} from "../controller/category.controller";
import upload from "../middlewares/uploadCategoryImages";

const categoryRoutes = Router();

//GET
categoryRoutes.get("/productsCount", getCategoriesWithProductCount);
categoryRoutes.get("/withProducts", getCategoriesWithProduct);
categoryRoutes.get("/select", getAllCategories);
categoryRoutes.get("/:id", getCategory);
categoryRoutes.get("/show/:id", getShowCategory);

//POST
categoryRoutes.post("/",upload.single('image'), createCategory);

//Put
categoryRoutes.put("/:id",upload.single('image'), updateCategory);

//DELETE
categoryRoutes.delete("/:id", deleteCtagory);

export default categoryRoutes;
