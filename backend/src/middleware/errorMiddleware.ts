import type { NextFunction, Request, Response } from "express";
import multer from "multer";

type ErrorWithCode = Error & { code?: string; statusCode?: number };

export function notFoundMiddleware(_req: Request, res: Response): void {
  res.status(404).json({ error: "Route not found." });
}

export function errorMiddleware(error: ErrorWithCode, _req: Request, res: Response, _next: NextFunction): void {
  if (error instanceof multer.MulterError && error.code === "LIMIT_FILE_SIZE") {
    res.status(400).json({ error: "CSV file must be 5MB or smaller." });
    return;
  }

  if (error.statusCode) {
    res.status(error.statusCode).json({ error: error.message });
    return;
  }

  if (error.code === "23505") {
    res.status(409).json({ error: "An account with that email already exists." });
    return;
  }

  console.error(error);
  res.status(500).json({ error: "Internal server error." });
}
