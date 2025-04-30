"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateCategory = exports.createCategory = exports.deleteCtagory = exports.getShowCategory = exports.getCategory = exports.getCategoriesWithProduct = exports.getCategoriesWithProductCount = exports.getAllCategories = void 0;
const utils_1 = require("../lib/utils");
const db_1 = __importDefault(require("../lib/db"));
const category_validation_1 = require("../validation/category.validation");
exports.getAllCategories = (0, utils_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const categories = yield db_1.default.category.findMany({
        select: {
            id: true,
            name: true,
        },
        orderBy: { name: "asc" },
    });
    res.status(200).json(categories);
}));
exports.getCategoriesWithProductCount = (0, utils_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const categories = yield db_1.default.category.findMany({
        include: {
            _count: {
                select: {
                    products: true,
                },
            },
        },
        orderBy: {
            createdAt: "desc",
        },
    });
    res.status(200).json(categories);
}));
exports.getCategoriesWithProduct = (0, utils_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const categories = yield db_1.default.category.findMany({
        select: {
            id: true,
            imageUri: true,
            name: true,
            position: true,
            products: {
                select: {
                    name: true,
                    price: true,
                    position: true,
                },
                where: {
                    isPublish: true,
                },
                orderBy: {
                    position: "asc",
                },
            },
        },
        orderBy: {
            position: "asc",
        },
    });
    res.status(200).json(categories);
}));
exports.getCategory = (0, utils_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const category = yield db_1.default.category.findUnique({
        where: {
            id: parseInt(id),
        },
        select: {
            id: true,
            name: true,
            imageUri: true,
            position: true,
        },
    });
    if (!category) {
        res.status(404).json({ message: "Category non trouvé" });
        return;
    }
    res.status(200).json(category);
}));
exports.getShowCategory = (0, utils_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const category = yield db_1.default.category.findUnique({
        where: {
            id: parseInt(id),
        },
        include: {
            products: true,
        },
    });
    if (!category) {
        res.status(404).json({ message: "Category non trouvé" });
        return;
    }
    res.status(200).json(category);
}));
exports.deleteCtagory = (0, utils_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const category = yield db_1.default.category.findUnique({
        where: {
            id: parseInt(id),
        },
    });
    if (!category) {
        res.status(404).json({ message: "Category non trouvé" });
        return;
    }
    yield db_1.default.category.delete({
        where: {
            id: parseInt(id),
        },
    });
    res.status(200).json({ message: "Catégorie supprimée avec succès" });
}));
exports.createCategory = (0, utils_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, position } = req.body;
    const { data, errors } = (0, category_validation_1.validateCreateCategory)({ name, position });
    if (!data) {
        res.status(400).json({ message: "Erreur de validation", errors });
        return;
    }
    const isExest = yield db_1.default.category.findUnique({
        where: {
            name: data.name,
        },
    });
    if (isExest) {
        res.status(400).json({
            message: "Erreur de validation",
            errors: { name: ["Ce nom existe déjà."] },
        });
        return;
    }
    const newCategory = yield db_1.default.category.create({
        data,
        include: {
            _count: {
                select: {
                    products: true,
                },
            },
        },
    });
    res
        .status(201)
        .json({ message: "Catégorie créée avec succès.", category: newCategory });
}));
exports.updateCategory = (0, utils_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const { name, position } = req.body;
    const existCategory = yield db_1.default.category.findUnique({
        where: {
            id: parseInt(id),
        },
    });
    if (!existCategory) {
        res.status(404).json({ message: "Category non trouvé" });
        return;
    }
    const { data, errors } = (0, category_validation_1.validateUpdateCategory)({ name, position });
    if (!data) {
        res.status(400).json({ message: "Erreur de validation", errors });
        return;
    }
    const newCategory = yield db_1.default.category.update({
        where: {
            id: parseInt(id),
        },
        data,
        include: {
            _count: {
                select: {
                    products: true,
                },
            },
        },
    });
    res.status(200).json({ message: "Catégorie modifiée avec succès.", category: newCategory });
}));
