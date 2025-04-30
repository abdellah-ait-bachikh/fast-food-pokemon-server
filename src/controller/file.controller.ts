import { Request, Response } from "express";
import { asyncHandler } from "../lib/utils";
import path from "path";
import fs from "fs";
export const getImageByName = asyncHandler(
  async (req: Request, res: Response) => {
    const { imageName } = req.params;
    const imagePath = path.join(
      __dirname,
      "../../uploads/images/categories",
      imageName
    );
    console.log(imagePath);
    if (fs.existsSync(imagePath)) {
      console.log("exist");
      res.sendFile(imagePath);
    } else {
      console.log(" not exist");
      res.status(404).json({ message: "Image not found." });
    }
  }
);
