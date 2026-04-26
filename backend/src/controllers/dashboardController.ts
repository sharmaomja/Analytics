import type { NextFunction, Request, Response } from "express";
import {
  createDashboard,
  findDashboardByIdForUser,
  findSavedQueryByIdForUser,
  listDashboardWidgetsByDashboardId,
  listDashboardsByUserId,
  listDatasetFieldsByDatasetId,
} from "../db/queries.js";
import { runDatasetQuery } from "../services/queryService.js";

type ErrorWithStatus = Error & { statusCode?: number };

export async function createDashboardHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ error: "Unauthorized." });
      return;
    }

    const name = String(req.body.name ?? "").trim();

    if (!name) {
      res.status(400).json({ error: "Dashboard name is required." });
      return;
    }

    const dashboard = await createDashboard(req.user.id, name);
    res.status(201).json({ message: "Dashboard created successfully.", dashboard });
  } catch (error) {
    next(error as ErrorWithStatus);
  }
}

export async function listDashboardsHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ error: "Unauthorized." });
      return;
    }

    const dashboards = await listDashboardsByUserId(req.user.id);
    res.status(200).json({ dashboards });
  } catch (error) {
    next(error as ErrorWithStatus);
  }
}

export async function getDashboardHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ error: "Unauthorized." });
      return;
    }

    const dashboardId = String(req.params.id ?? "").trim();

    if (!dashboardId) {
      res.status(400).json({ error: "Dashboard id is required." });
      return;
    }

    const dashboard = await findDashboardByIdForUser(dashboardId, req.user.id);

    if (!dashboard) {
      res.status(404).json({ error: "Dashboard not found." });
      return;
    }

    const widgets = await listDashboardWidgetsByDashboardId(dashboard.id);
    const hydratedWidgets = await Promise.all(
      widgets.map(async widget => {
        const savedQuery = await findSavedQueryByIdForUser(widget.query_id, req.user!.id);

        if (!savedQuery) {
          return {
            ...widget,
            query_name: null,
            metric: null,
            rows: [],
          };
        }

        const fields = await listDatasetFieldsByDatasetId(savedQuery.dataset_id);
        const rows = await runDatasetQuery(savedQuery.query_config, fields);

        return {
          ...widget,
          query_name: savedQuery.name,
          query_config: savedQuery.query_config,
          metric: savedQuery.query_config.metrics[0] ?? null,
          rows,
        };
      }),
    );

    res.status(200).json({ dashboard, widgets: hydratedWidgets });
  } catch (error) {
    next(error as ErrorWithStatus);
  }
}
