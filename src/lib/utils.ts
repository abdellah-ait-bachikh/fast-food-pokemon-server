import { NextFunction, Request, Response } from "express";
import { AsyncFunction } from "../types/globale";
import fs from 'fs';
import path from 'path';

export const isError = (err: unknown): err is Error => {
  return (
    err instanceof Error &&
    typeof err === "object" &&
    typeof (err as Error).message === "string"
  );
};

export const asyncHandler = (fn: AsyncFunction) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

export function deleteFile(fileName: string | undefined, folderPath: string): void {
  if(fileName === undefined) return
  const filePath = path.join(folderPath, fileName);

  fs.unlink(filePath, (err) => {
    if (err) {
      console.error(`❌ Failed to delete file: ${filePath}`, err.message);
    } else {
      console.log(`✅ File deleted: ${filePath}`);
    }
  });
}
