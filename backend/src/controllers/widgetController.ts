import type { NextFunction, Request, Response } from "express";
import { createDashboardWidget, findDashboardByIdForUser, findSavedQueryByIdForUser, type ChartType, type WidgetPosition, deleteDashboardWidgetByIdForUser } from "../db/queries.js";

type ErrorWithStatus = Error & { statusCode?: number };

const allowedChartTypes = new Set<ChartType>(["line", "bar"]);

function normalizePosition(positionValue: unknown): WidgetPosition | null {
  if (!positionValue || typeof positionValue !== "object") {
    return null;
  }

  const position = positionValue as Partial<WidgetPosition>;
  const x = Number(position.x);
  const y = Number(position.y);
  const w = Number(position.w);
  const h = Number(position.h);

  if (![x, y, w, h].every(Number.isFinite) || w <= 0 || h <= 0) {
    return null;
  }

  return { x, y, w, h };
}

export async function createWidgetHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ error: "Unauthorized." });
      return;
    }

    const dashboardId = String(req.body.dashboard_id ?? "").trim();
    const queryId = String(req.body.query_id ?? "").trim();
    const chartType = String(req.body.chart_type ?? "").trim() as ChartType;
    const position = normalizePosition(req.body.position);

    if (!dashboardId) {
      res.status(400).json({ error: "dashboard_id is required." });
      return;
    }

    if (!queryId) {
      res.status(400).json({ error: "query_id is required." });
      return;
    }

    if (!allowedChartTypes.has(chartType)) {
      res.status(400).json({ error: "chart_type must be line or bar." });
      return;
    }

    if (!position) {
      res.status(400).json({ error: "position must include numeric x, y, w, and h values." });
      return;
    }

    const dashboard = await findDashboardByIdForUser(dashboardId, req.user.id);

    if (!dashboard) {
      res.status(404).json({ error: "Dashboard not found." });
      return;
    }

    const query = await findSavedQueryByIdForUser(queryId, req.user.id);

    if (!query) {
      res.status(404).json({ error: "Saved query not found." });
      return;
    }

    const widget = await createDashboardWidget(dashboard.id, query.id, chartType, position);

    res.status(201).json({ message: "Widget added successfully.", widget });
  } catch (error) {
    next(error as ErrorWithStatus);
  }
}

export async function deleteWidgetHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ error: "Unauthorized." });
      return;
    }

    const widgetId = String(req.params.id ?? "").trim();

    if (!widgetId) {
      res.status(400).json({ error: "Widget id is required." });
      return;
    }

    const widget = await deleteDashboardWidgetByIdForUser(widgetId, req.user.id);

    if (!widget) {
      res.status(404).json({ error: "Widget not found." });
      return;
    }

    res.status(200).json({ message: "Widget removed successfully.", widget });
  } catch (error) {
    next(error as ErrorWithStatus);
  }
}
