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
    });
    res.status(200).json(categories);
  }
);
