import { Router } from "express";
import { deleteCtagory, getAllCategories } from "../controller/category.controller";

const categoryRoutes = Router();
categoryRoutes.get("/select", getAllCategories);

categoryRoutes.get("/:id", deleteCtagory);
export default categoryRoutes;
