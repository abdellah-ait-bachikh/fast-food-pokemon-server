import { Request, Response } from "express";
import { asyncHandler } from "../lib/utils";
import db from "../lib/db";
import { TcreateCatgory } from "../types/category.type";
import { validateCreateCategory } from "../validation/category.validation";

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
        imageFile: true,
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
      imageFile: true,
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
    await db.category.delete({
      where: {
        id: parseInt(id),
      },
    });
    res.status(200).json({ message: "Catégorie supprimée avec succès" });
  }
);

export const createCategory = asyncHandler(
  async (req: Request<{}, {}, TcreateCatgory>, res: Response) => {
    const { name, position } = req.body;
    const { data, errors } = validateCreateCategory({ name, position });
    if (!data) {
      res.status(400).json({ message: "Erreur de validation", errors });
      return;
    }
    const isExest = await db.category.findUnique({
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
    const newCategory = await db.category.create({
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
  }
);
