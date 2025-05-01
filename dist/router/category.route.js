"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const category_controller_1 = require("../controller/category.controller");
const uploadCategoryImages_1 = __importDefault(require("../middlewares/uploadCategoryImages"));
const categoryRoutes = (0, express_1.Router)();
//GET
categoryRoutes.get("/productsCount", category_controller_1.getCategoriesWithProductCount);
categoryRoutes.get("/withProducts", category_controller_1.getCategoriesWithProduct);
categoryRoutes.get("/select", category_controller_1.getAllCategories);
categoryRoutes.get("/:id", category_controller_1.getCategory);
categoryRoutes.get("/show/:id", category_controller_1.getShowCategory);
//POST
categoryRoutes.post("/", uploadCategoryImages_1.default.single('image'), category_controller_1.createCategory);
//Put
categoryRoutes.put("/:id", uploadCategoryImages_1.default.single('image'), category_controller_1.updateCategory);
//DELETE
categoryRoutes.delete("/:id", category_controller_1.deleteCtagory);
exports.default = categoryRoutes;
