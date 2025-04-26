import { Router } from "express";
import { getAllCategories } from "../controller/category.controller";

const categoryRoutes = Router();
categoryRoutes.get("/select", getAllCategories);
export default categoryRoutes;
