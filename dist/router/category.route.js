"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const category_controller_1 = require("../controller/category.controller");
const categoryRoutes = (0, express_1.Router)();
//GET
categoryRoutes.get("/productsCount", category_controller_1.getCategoriesWithProductCount);
categoryRoutes.get("/withProducts", category_controller_1.getCategoriesWithProduct);
categoryRoutes.get("/select", category_controller_1.getAllCategories);
categoryRoutes.get("/:id", category_controller_1.getCategory);
categoryRoutes.get("/show/:id", category_controller_1.getShowCategory);
//POST
categoryRoutes.post("/", category_controller_1.createCategory);
//Put
categoryRoutes.put("/:id", category_controller_1.createCategory);
//DELETE
categoryRoutes.delete("/:id", category_controller_1.deleteCtagory);
exports.default = categoryRoutes;
