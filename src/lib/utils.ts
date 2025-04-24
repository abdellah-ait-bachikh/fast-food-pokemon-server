import { NextFunction, Request, Response } from "express";
import { AsyncFunction } from "../types/globale";

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
