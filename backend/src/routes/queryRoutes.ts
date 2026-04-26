import { Router } from "express";
import { listDatasetFieldsHandler, runQueryHandler, saveQueryHandler } from "../controllers/queryController.js";
import { requireAuth } from "../middleware/authMiddleware.js";

export const queryRouter = Router();

queryRouter.use(requireAuth);
queryRouter.get("/fields/:datasetId", listDatasetFieldsHandler);
queryRouter.post("/run", runQueryHandler);
queryRouter.post("/save", saveQueryHandler);
