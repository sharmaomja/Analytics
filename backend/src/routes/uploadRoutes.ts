import { Router } from "express";
import multer from "multer";
import { uploadCsvHandler } from "../controllers/uploadController.js";
import { requireAuth } from "../middleware/authMiddleware.js";

const allowedMimeTypes = new Set(["text/csv", "application/vnd.ms-excel", "text/plain"]);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
  fileFilter: (_req, file, callback) => {
    const hasCsvExtension = file.originalname.toLowerCase().endsWith(".csv");
    const hasAllowedMimeType = !file.mimetype || allowedMimeTypes.has(file.mimetype);

    if (!hasCsvExtension || !hasAllowedMimeType) {
      const error = new Error("Only CSV files are allowed.") as Error & { statusCode?: number };
      error.statusCode = 400;
      callback(error);
      return;
    }

    callback(null, true);
  },
});

export const uploadRouter = Router();

uploadRouter.post("/", requireAuth, upload.single("file"), uploadCsvHandler);
