import { Request, Response } from "express";
import { asyncHandler } from "../lib/utils";
import db from "../lib/db";

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
// export const getCategoriesWithProduct = asyncHandler(
//   async (req: Request, res: Response) => {
//     const categories = await db.category.findMany({
//       include: {
//         products: true,
//       },orderBy:
//     });
//     res.status(200).json(categories);
//   }
// );

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
