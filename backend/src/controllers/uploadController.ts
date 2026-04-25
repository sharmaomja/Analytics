import type { NextFunction, Request, Response } from "express";
import { createFileRecord, findDatasetByIdForUser, toSafeFileRecord } from "../db/queries.js";
import { processUploadedCsv } from "../services/parserService.js";

type ErrorWithStatus = Error & { statusCode?: number };

export async function uploadCsvHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ error: "Unauthorized." });
      return;
    }

    const datasetId = String(req.body.datasetId ?? "").trim();

    if (!datasetId) {
      res.status(400).json({ error: "datasetId is required." });
      return;
    }

    const uploadedFile = req.file;

    if (!uploadedFile) {
      res.status(400).json({ error: "A CSV file is required." });
      return;
    }

    const dataset = await findDatasetByIdForUser(datasetId, req.user.id);

    if (!dataset) {
      res.status(404).json({ error: "Dataset not found." });
      return;
    }

    const rawContent = uploadedFile.buffer.toString("utf8");

    if (!rawContent.trim()) {
      res.status(400).json({ error: "Uploaded CSV file is empty." });
      return;
    }

    const fileRecord = await createFileRecord(
      dataset.id,
      uploadedFile.originalname,
      uploadedFile.mimetype || "text/csv",
      rawContent,
      "uploaded",
    );

    const insertedCount = await processUploadedCsv({
      datasetId: dataset.id,
      fileId: fileRecord.id,
      rawContent,
    });

    res.status(201).json({
      message: "CSV uploaded and parsed successfully.",
      dataset,
      file: {
        ...toSafeFileRecord(fileRecord),
        status: "ready",
      },
      insertedCount,
    });
  } catch (error) {
    next(error as ErrorWithStatus);
  }
}
