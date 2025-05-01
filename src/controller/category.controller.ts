import { Request, Response } from "express";
import { asyncHandler, deleteFile } from "../lib/utils";
import db from "../lib/db";
import { TcreateCatgory, TupdateCategory } from "../types/category.type";
import {
  validateCreateCategory,
  validateUpdateCategory,
} from "../validation/category.validation";

export const getAllCategories = asyncHandler(
  async (req: Request, res: Response) => {
    const categories = await db.category.findMany({
      select: {
        id: true,
        name: true,
      },
      orderBy: { name: "asc" },
    });
    res.status(200).json(categories);
  }
);

export const getCategoriesWithProductCount = asyncHandler(
  async (req: Request, res: Response) => {
    const categories = await db.category.findMany({
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
  }
);

export const getCategoriesWithProduct = asyncHandler(
  async (req: Request, res: Response) => {
    const categories = await db.category.findMany({
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
  }
);

export const getCategory = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const category = await db.category.findUnique({
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
});

export const getShowCategory = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const category = await db.category.findUnique({
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
  }
);

export const deleteCtagory = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const category = await db.category.findUnique({
      where: {
        id: parseInt(id),
      },
    });
    if (!category) {
      res.status(404).json({ message: "Category non trouvé" });
      return;
    }
    const imageName = category.imageUri || undefined;
    await db.category.delete({
      where: {
        id: parseInt(id),
      },
    });
    deleteFile(imageName, "uploads/images/categories");
    res.status(200).json({ message: "Catégorie supprimée avec succès" });
  }
);

export const createCategory = asyncHandler(
  async (req: Request<{}, {}, TcreateCatgory>, res: Response) => {
    const { name, position } = req.body;
    const { data, errors } = validateCreateCategory({ name, position });
    const imageName = req.file?.filename;
    if (!data) {
      deleteFile(imageName, "uploads/images/categories");
      res.status(400).json({ message: "Erreur de validation", errors });
      return;
    }
    const isExest = await db.category.findUnique({
      where: {
        name: data.name,
      },
    });
    if (isExest) {
      deleteFile(imageName, "uploads/images/categories");

      res.status(400).json({
        message: "Erreur de validation",
        errors: { name: ["Ce nom existe déjà."] },
      });
      return;
    }
    const newCategory = await db.category.create({
      data: {
        ...data,
        imageUri: imageName,
      },
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
  }
);

export const updateCategory = asyncHandler(
  async (req: Request<{}, {}, TupdateCategory>, res: Response) => {
    console.log(req.body);
    const { id } = req.params as { id: string };
    const { name, position,imageUri } = req.body;
    const newImageName = req.file?.filename;
    let updatedImageUri: string | null | undefined = undefined;
    const existCategory = await db.category.findUnique({
      where: {
        id: parseInt(id),
      },
    });
    if (!existCategory) {
      res.status(404).json({ message: "Category non trouvé" });
      return;
    }
    const { data, errors } = validateUpdateCategory({ name, position });
    if (!data) {
      res.status(400).json({ message: "Erreur de validation", errors });
      return;
    }
    if(imageUri===null){
      updatedImageUri = null
    }else if(newImageName) {
      updatedImageUri=newImageName
    }
    const newCategory = await db.category.update({
      where: {
        id: parseInt(id),
      },
      data: {
        ...data,
        imageUri: updatedImageUri,
      },
      include: {
        _count: {
          select: {
            products: true,
          },
        },
      },
    });
    if (updatedImageUri || updatedImageUri===null) {
      if (existCategory.imageUri) {
        deleteFile(existCategory.imageUri, "uploads/images/categories");
      }
    }
    res.status(200).json({
      message: "Catégorie modifiée avec succès.",
      category: newCategory,
    });
  }
);
