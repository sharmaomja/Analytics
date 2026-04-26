import { Router } from "express";
import { createDashboardHandler, getDashboardHandler, listDashboardsHandler } from "../controllers/dashboardController.js";
import { requireAuth } from "../middleware/authMiddleware.js";

export const dashboardRouter = Router();

dashboardRouter.use(requireAuth);
dashboardRouter.post("/", createDashboardHandler);
dashboardRouter.get("/", listDashboardsHandler);
dashboardRouter.get("/:id", getDashboardHandler);
