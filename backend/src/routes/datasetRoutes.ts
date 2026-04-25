import { Router } from "express";
import { createDatasetHandler, listDatasetsHandler } from "../controllers/datasetController.js";
import { requireAuth } from "../middleware/authMiddleware.js";

export const datasetRouter = Router();

datasetRouter.use(requireAuth);
datasetRouter.post("/", createDatasetHandler);
datasetRouter.get("/", listDatasetsHandler);
