import { Router } from "express";
import { createWidgetHandler, deleteWidgetHandler } from "../controllers/widgetController.js";
import { requireAuth } from "../middleware/authMiddleware.js";

export const widgetRouter = Router();

widgetRouter.use(requireAuth);
widgetRouter.post("/", createWidgetHandler);
widgetRouter.delete("/:id", deleteWidgetHandler);
